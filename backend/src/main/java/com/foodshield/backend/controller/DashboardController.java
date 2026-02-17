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
        long pendingClaims = claimRepository.findByStatus("ANALYZING").size()
                + claimRepository.findByStatus("REVIEW").size();
        long approvedClaims = claimRepository.findByStatus("SAFE").size(); // Assuming SAFE means approved/refunded for
                                                                           // now
        long rejectedClaims = claimRepository.findByStatus("HIGH_RISK").size()
                + claimRepository.findByStatus("FRAUD").size();

        long totalUsers = userRepository.count();

        stats.put("total_claims", totalClaims);
        stats.put("pending_reviews", pendingClaims);
        stats.put("auto_approved", approvedClaims);
        stats.put("auto_rejected", rejectedClaims);
        stats.put("active_users", totalUsers);

        return stats;
    }
}
