package com.foodshield.backend.service;

import com.foodshield.backend.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    ClaimRepository claimRepository;

    public List<Map<String, Object>> getMonthlyTrends() {
        List<Object[]> results = claimRepository.findMonthlyClaimStats();
        List<Map<String, Object>> trends = new ArrayList<>();

        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", result[0]);
            map.put("fraud", result[1]);
            map.put("legitimate", result[2]);
            trends.add(map);
        }
        return trends;
    }

    public Double getTotalSavings() {
        return claimRepository.calculateTotalSavings();
    }

    public List<Map<String, Object>> getHighRiskRestaurants() {
        List<Object[]> results = claimRepository.findHighRiskRestaurants();
        List<Map<String, Object>> restaurants = new ArrayList<>();

        // Limit to Top 5
        int limit = Math.min(results.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] result = results.get(i);
            Map<String, Object> map = new HashMap<>();
            map.put("name", result[0]);
            map.put("count", result[1]);
            restaurants.add(map);
        }
        return restaurants;
    }
}
