package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.model.FraudAnalysis;
import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.FraudAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Random;
import java.io.File;
import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;

@Service
public class FraudEngineService {

        @Autowired
        FraudAnalysisRepository fraudAnalysisRepository;

        @Autowired
        ClaimRepository claimRepository;

        @Autowired
        MLServiceClient mlServiceClient;

        @Autowired
        SystemConfigService systemConfigService;

        @Autowired
        BlacklistService blacklistService;

        @Autowired
        AuditLogService auditLogService;

        @Autowired
        NotificationService notificationService;

        @Autowired
        TrustLevelService trustLevelService;

        @Autowired
        ImageHashService imageHashService;

        private final Random random = new Random();

        @Transactional
        public FraudAnalysis analyzeClaim(Claim claim) {
                String username = claim.getUser().getUsername();

                String behaviorAnalysis = "";
                
                // Dynamic Blacklisting based on Customer Behaviour
                // E.g., if a user has 3 or more previously Rejected/Fraud/High-Risk claims, auto-blacklist them.
                if (!blacklistService.isBlacklisted(username)) {
                        long fraudCount = claimRepository.countByUser_UsernameAndStatusIn(
                                username, Arrays.asList("FRAUD", "HIGH_RISK"));
                        
                        if (fraudCount >= 5) {
                                behaviorAnalysis = "Negative Feedback: Suspicious behaviour detected. The user has a severe history of " + fraudCount + " fraudulent/high-risk claims. Automatic blacklisting enforced.";
                                blacklistService.addToBlacklist(username, "Automatic blacklisting due to suspicious customer behaviour (multiple fraudulent/high-risk claims).", "System");
                                auditLogService.log("AUTO_BLACKLISTED", "System", "User", null,
                                        null, username, "Auto-blacklisted after " + fraudCount + " fraudulent claims");
                        } else if (fraudCount > 0) {
                                behaviorAnalysis = "Negative Feedback: Caution advised. The user has " + fraudCount + " previous fraudulent/high-risk claims on record.";
                        } else {
                                behaviorAnalysis = "Positive Feedback: The user has a clean history and shows legitimate customer behaviour.";
                        }
                } else {
                        behaviorAnalysis = "Negative Feedback: The user is currently blacklisted due to past suspicious behaviour.";
                }

                // 0. Check Blacklist
                if (blacklistService.isBlacklisted(username)) {
                        claim.setRiskScore(100);
                        claim.setStatus("REJECTED");
                        claim.setDecisionMode("Automated");
                        claimRepository.save(claim);

                        FraudAnalysis analysis = new FraudAnalysis(claim, 100, 100, 100, 100,
                                        "User is Blacklisted. Auto-Rejected.", behaviorAnalysis);
                        
                        auditLogService.log("FRAUD_ANALYZED", "System", "Claim", claim.getId(),
                                        "ANALYZING", "REJECTED", "Score: 100, Decision: Automated, BLACKLISTED");
                        
                        return fraudAnalysisRepository.save(analysis);
                }

                // 1. Call Python ML Service for Image Analysis
                // claim.getImageUrl() contains relative path "uploads/filename.jpg" or comma separated paths
                String firstImageUrl = (claim.getImageUrl() != null && !claim.getImageUrl().isEmpty()) ? claim.getImageUrl().split(",")[0] : "";
                MLServiceClient.MLResponse mlResponse = mlServiceClient.analyzeImage(firstImageUrl);

                int aiScore = 0;
                if (mlResponse.is_ai_generated) {
                        aiScore = (int) (mlResponse.confidence * 100);
                } else {
                        aiScore = (int) ((1.0 - mlResponse.confidence) * 20);
                        if (aiScore < 0)
                                aiScore = 0;
                }

                // 2. Duplicate Image Detection (pHash)
                boolean isDuplicate = false;
                Long duplicateClaimId = null;
                String imageHash = imageHashService.computePerceptualHash(firstImageUrl);
                if (imageHash != null) {
                        ImageHashService.DuplicateCheckResult dupResult = imageHashService.checkForDuplicates(imageHash, claim.getId());
                        isDuplicate = dupResult.isDuplicate;
                        duplicateClaimId = dupResult.matchedClaimId;
                        if (isDuplicate) {
                                auditLogService.log("DUPLICATE_IMAGE", "System", "Claim", claim.getId(),
                                        null, "Match: Claim #" + duplicateClaimId,
                                        "Hamming distance: " + dupResult.hammingDistance);
                        }
                        // Store hash for future comparisons
                        imageHashService.storeHash(imageHash, claim.getId(), firstImageUrl, username);
                }

                // Real Metadata extraction logic
                int metadataScore = 0;
                int findingScore = random.nextInt(20);
                
                try {
                    File imgFile = new File(firstImageUrl);
                    if (imgFile.exists()) {
                        Metadata metadata = ImageMetadataReader.readMetadata(imgFile);
                        ExifIFD0Directory directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
                        if (directory != null && directory.containsTag(ExifIFD0Directory.TAG_SOFTWARE)) {
                            String software = directory.getString(ExifIFD0Directory.TAG_SOFTWARE).toLowerCase();
                            if (software.contains("photoshop") || software.contains("lightroom") || software.contains("canva")) {
                                metadataScore = 80; // High risk: Edited image detected via EXIF
                            }
                        } else {
                            metadataScore = 20; // Default penalty for stripped metadata
                        }
                    } else {
                        metadataScore = 20;
                    }
                } catch (Exception e) {
                    metadataScore = 30; // Exception parsing metadata
                }

                System.out.println(
                                "Analyzing Claim ID: " + claim.getId() + " | AI: " + aiScore +
                                                " | Prediction: " + mlResponse.is_ai_generated);

                // Fetch Dynamic Configuration
                com.foodshield.backend.model.SystemConfig config = systemConfigService.getGlobalConfig();

                // Weighted Formula: 0.6*AI + 0.2*Metadata + 0.2*Findings
                // Increased weight for AI as per user requirement
                int rawScore = (int) ((aiScore * 0.6) + (metadataScore * 0.2) + (findingScore * 0.2));

                // Boost score if duplicate image detected
                if (isDuplicate) {
                        rawScore = Math.min(100, rawScore + 40);
                }

                // Apply trust level modifier (trusted users get lower scores)
                double trustModifier = trustLevelService.getTrustModifier(
                        claim.getUser().getTrustLevel());
                int finalScore = (int) (rawScore * trustModifier);
                if (finalScore > 100) finalScore = 100;

                String status = "SAFE";
                if (finalScore >= config.getAutoRejectScore()) {
                        status = "HIGH_RISK"; // Auto-Reject equivalent or severe risk
                } else if (finalScore >= config.getManualReviewStart()) {
                        status = "REVIEW";
                }

                // Force High Risk only if AI confidence is very high
                // to reduce false positives while the model is untrained
                if (mlResponse.is_ai_generated && mlResponse.confidence >= 0.98) {
                        status = "HIGH_RISK";
                }

                // If ML service signalled uncertainty (confidence == 0.5), route to REVIEW
                if (!mlResponse.is_ai_generated && mlResponse.confidence == 0.5 && !"HIGH_RISK".equals(status)) {
                        status = "REVIEW";
                }

                // If ML service failed or duplicate image found, force review or high risk
                if (isDuplicate) {
                        status = "HIGH_RISK";
                } else if ("ML Service Failed".equals(mlResponse.message) && !"HIGH_RISK".equals(status)) {
                        status = "REVIEW";
                }

                // Auto-Reject if not food
                if (!mlResponse.is_food) {
                        status = "REJECTED";
                        finalScore = 100; // Invalid
                }

                // Determine decision mode
                String decisionMode = "REVIEW".equals(status) ? "Manual" : "Automated";

                // Update Claim Status
                claim.setRiskScore(finalScore);
                claim.setStatus(status);
                claim.setDecisionMode(decisionMode);
                claimRepository.save(claim);

                String duplicateFlag = isDuplicate ? " DUPLICATE IMAGE from Claim #" + duplicateClaimId + "." : "";
                String explanation = String.format("Food Verification: %s. AI Detection: %s (Confidence: %.2f%%). %s%s",
                                mlResponse.is_food ? "PASSED" : "FAILED (Not Food)",
                                mlResponse.is_ai_generated ? "AI GENERATED" : "Authentic",
                                mlResponse.confidence * 100,
                                mlResponse.message != null ? mlResponse.message : "",
                                duplicateFlag);

                FraudAnalysis analysis = new FraudAnalysis(claim, aiScore, metadataScore, findingScore, finalScore,
                                explanation, behaviorAnalysis);
                analysis.setDuplicateImageDetected(isDuplicate);
                analysis.setDuplicateClaimId(duplicateClaimId);

                // Log fraud analysis completion
                auditLogService.log("FRAUD_ANALYZED", "System", "Claim", claim.getId(),
                                "ANALYZING", status, "Score: " + finalScore + ", Decision: " + decisionMode
                                + (isDuplicate ? ", DUPLICATE" : ""));

                // Send email notification for automated decisions
                if (!"REVIEW".equals(status)) {
                        notificationService.sendClaimStatusEmail(claim, status);
                }

                return fraudAnalysisRepository.save(analysis);
        }
}
