package com.foodshield.backend.controller;

import com.foodshield.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    ReportService reportService;

    @GetMapping("/trends")
    public List<Map<String, Object>> getTrends() {
        return reportService.getMonthlyTrends();
    }

    @GetMapping("/savings")
    public Map<String, Double> getSavings() {
        Double savings = reportService.getTotalSavings();
        return Map.of("totalSavings", savings != null ? savings : 0.0);
    }

    @GetMapping("/risk-restaurants")
    public List<Map<String, Object>> getRiskRestaurants() {
        return reportService.getHighRiskRestaurants();
    }
}
