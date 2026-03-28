package com.foodshield.backend.repository;

import com.foodshield.backend.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
        List<Claim> findByStatus(String status);

        long countByStatus(String status);

        List<Claim> findByDecisionMode(String decisionMode);

        long countByUser_UsernameAndStatusIn(String username, List<String> statuses);

        @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('TO_CHAR', c.createdAt, 'Mon') as month, " +
                        "SUM(CASE WHEN c.status = 'FRAUD' THEN 1 ELSE 0 END) as fraud, " +
                        "SUM(CASE WHEN c.status = 'SAFE' THEN 1 ELSE 0 END) as legitimate " +
                        "FROM Claim c GROUP BY FUNCTION('TO_CHAR', c.createdAt, 'Mon')")
        List<Object[]> findMonthlyClaimStats();

        @org.springframework.data.jpa.repository.Query("SELECT SUM(c.amount) FROM Claim c WHERE c.status = 'FRAUD' OR c.status = 'HIGH_RISK'")
        Double calculateTotalSavings();

        @org.springframework.data.jpa.repository.Query("SELECT c.restaurantName, COUNT(c) as fraudCount " +
                        "FROM Claim c WHERE c.status = 'FRAUD' OR c.status = 'HIGH_RISK' " +
                        "GROUP BY c.restaurantName ORDER BY fraudCount DESC")
        List<Object[]> findHighRiskRestaurants();
}
