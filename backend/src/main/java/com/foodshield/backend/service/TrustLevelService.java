package com.foodshield.backend.service;

import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class TrustLevelService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Recalculates and updates a user's trust level based on their claim history.
     * 
     * PLATINUM: 10+ safe claims, 0 fraudulent
     * GOLD: 5+ safe claims, 0 fraudulent
     * SILVER: 2+ safe claims, <=1 fraudulent
     * BRONZE: 1+ safe claims
     * NEW: No history
     */
    public String recalculateTrustLevel(User user) {
        long safeCount = claimRepository.countByUser_UsernameAndStatusIn(
                user.getUsername(), Arrays.asList("SAFE"));
        long fraudCount = claimRepository.countByUser_UsernameAndStatusIn(
                user.getUsername(), Arrays.asList("REJECTED", "FRAUD", "HIGH_RISK"));

        String newLevel;

        if (safeCount >= 10 && fraudCount == 0) {
            newLevel = "PLATINUM";
        } else if (safeCount >= 5 && fraudCount == 0) {
            newLevel = "GOLD";
        } else if (safeCount >= 2 && fraudCount <= 1) {
            newLevel = "SILVER";
        } else if (safeCount >= 1 && fraudCount == 0) {
            newLevel = "BRONZE";
        } else {
            newLevel = "NEW";
        }

        user.setTrustLevel(newLevel);
        userRepository.save(user);
        return newLevel;
    }

    /**
     * Returns a risk weight modifier based on trust level.
     * Higher trust = lower risk modifier (benefits good users).
     */
    public double getTrustModifier(String trustLevel) {
        if (trustLevel == null) return 1.0;
        return switch (trustLevel) {
            case "PLATINUM" -> 0.6;
            case "GOLD" -> 0.75;
            case "SILVER" -> 0.85;
            case "BRONZE" -> 0.95;
            default -> 1.0; // NEW users get no benefit
        };
    }
}
