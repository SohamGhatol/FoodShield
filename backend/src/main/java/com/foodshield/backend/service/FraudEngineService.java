package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.model.FraudAnalysis;
import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.FraudAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
public class FraudEngineService {

    @Autowired
    FraudAnalysisRepository fraudAnalysisRepository;

    @Autowired
    ClaimRepository claimRepository;

    private final Random random = new Random();

    @Transactional
    public FraudAnalysis analyzeClaim(Claim claim) {
        // Mock Logic for Phase 2
        // In Phase 3, this will call the Python Microservice

        int aiScore = random.nextInt(101); // 0-100
        int metadataScore = random.nextInt(101);
        int findingScore = random.nextInt(101);

        // Weighted Formula: 0.4*AI + 0.3*Metadata + 0.3*Findings
        int finalScore = (int) ((aiScore * 0.4) + (metadataScore * 0.3) + (findingScore * 0.3));

        String status = finalScore > 75 ? "HIGH_RISK" : (finalScore > 40 ? "REVIEW" : "SAFE");

        // Update Claim Status
        claim.setRiskScore(finalScore);
        claim.setStatus(status);
        claimRepository.save(claim);

        String explanation = "AI detected potential anomaly with " + aiScore + "% confidence. " +
                "Metadata analysis indicates " + metadataScore + "% risk.";

        FraudAnalysis analysis = new FraudAnalysis(claim, aiScore, metadataScore, findingScore, finalScore,
                explanation);

        return fraudAnalysisRepository.save(analysis);
    }
}
