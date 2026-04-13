package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;

@Service
public class ClaimService {

    @Autowired
    ClaimRepository claimRepository;

    @Autowired
    com.foodshield.backend.repository.UserRepository userRepository;

    @Autowired
    FraudEngineService fraudEngineService;

    @Autowired
    AuditLogService auditLogService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    TrustLevelService trustLevelService;

    private final Path rootLocation = Paths.get("uploads");

    public Claim createClaim(String restaurantName, Double amount, String claimantName, String complaint, List<MultipartFile> files)
            throws IOException {
        // 1. Save Image
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }

        StringBuilder imageUrlBuilder = new StringBuilder();
        if (files != null && !files.isEmpty()) {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file.isEmpty()) continue;
                String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path destinationFile = rootLocation.resolve(filename);
                Files.copy(file.getInputStream(), destinationFile);
                if (imageUrlBuilder.length() > 0) imageUrlBuilder.append(",");
                imageUrlBuilder.append(destinationFile.toString().replace("\\", "/"));
            }
        }

        // 2. Get Current User
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        com.foodshield.backend.model.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Create Claim
        Claim claim = new Claim();
        claim.setRestaurantName(restaurantName);
        claim.setClaimantName(claimantName);
        claim.setAmount(amount);
        claim.setComplaint(complaint);
        claim.setStatus("ANALYZING");
        claim.setRiskScore(0);
        claim.setImageUrl(imageUrlBuilder.toString());
        claim.setUser(user);
        claim.setCreatedAt(java.time.LocalDateTime.now());

        // 4. Save to DB
        claim = claimRepository.save(claim);

        // 5. Log audit event
        auditLogService.log("CLAIM_CREATED", username, "Claim", claim.getId(),
                null, "ANALYZING", "Restaurant: " + restaurantName + ", Amount: " + amount);

        // 6. Trigger Fraud Analysis (Synchronous for now)
        fraudEngineService.analyzeClaim(claim);

        // 7. Return updated claim (already saved inside analyzeClaim)
        return claimRepository.findById(claim.getId()).orElse(claim);
    }

    public List<Claim> getAllClaims() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.foodshield.backend.model.User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && "USER".equals(user.getRole())) {
            return claimRepository.findByUser_Username(username);
        }
        return claimRepository.findAll();
    }

    public List<Claim> getClaimsByStatus(String status) {
        return claimRepository.findByStatus(status);
    }

    public Claim getClaimById(Long id) {
        Claim claim = claimRepository.findById(id).orElseThrow(() -> new RuntimeException("Claim not found"));
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.foodshield.backend.model.User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && "USER".equals(user.getRole())) {
            if (!claim.getUser().getUsername().equals(username)) {
                throw new RuntimeException("Access Denied");
            }
        }
        return claim;
    }

    public Claim updateClaimStatus(Long id, String status) {
        Claim claim = getClaimById(id);
        String oldStatus = claim.getStatus();
        claim.setStatus(status);
        claim.setDecisionMode("Manual");
        Claim savedClaim = claimRepository.save(claim);

        // Log audit event
        String adminUser = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        auditLogService.log("STATUS_CHANGED", adminUser, "Claim", id,
                oldStatus, status, "Decision: Manual");

        // Send email notification
        notificationService.sendClaimStatusEmail(savedClaim, status);

        // Recalculate trust level after decision
        if (savedClaim.getUser() != null) {
            trustLevelService.recalculateTrustLevel(savedClaim.getUser());
        }

        return savedClaim;
    }
}
