package com.foodshield.backend.controller;

import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    ClaimRepository claimRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalClaims = claimRepository.count();

        long reviewClaims = claimRepository.countByStatus("REVIEW");
        long analyzingClaims = claimRepository.countByStatus("ANALYZING");
        long safeClaims = claimRepository.countByStatus("SAFE");
        long highRiskClaims = claimRepository.countByStatus("HIGH_RISK");
        long rejectedClaims = claimRepository.countByStatus("REJECTED");

        long pendingReviews = reviewClaims + analyzingClaims;
        long autoApproved = safeClaims;
        long autoRejected = highRiskClaims + rejectedClaims;
        long automatedDecisions = autoApproved + autoRejected;

        // Savings estimate: sum of amounts for HIGH_RISK and REJECTED
        Double totalSavings = claimRepository.calculateTotalSavings();
        if (totalSavings == null)
            totalSavings = 0.0;

        long totalUsers = userRepository.count();

        stats.put("total_claims", totalClaims);
        stats.put("pending_reviews", pendingReviews);
        stats.put("manual_review", reviewClaims);
        stats.put("auto_approved", autoApproved);
        stats.put("auto_rejected", autoRejected);
        stats.put("automated_decisions", automatedDecisions);
        stats.put("total_savings", totalSavings);
        stats.put("active_users", totalUsers);

        return stats;
    }
}
