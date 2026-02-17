package com.foodshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true) // Can be anonymous or linked to user
    private User user;

    private String restaurantName;
    private Double amount;

    // Status: ANALYZING, SAFE, HIGH_RISK, REVIEW
    private String status;

    // Risk Score: 0-100
    private Integer riskScore;

    private String imagePath;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Claim(String restaurantName, Double amount, String status, Integer riskScore, String imagePath, User user) {
        this.restaurantName = restaurantName;
        this.amount = amount;
        this.status = status;
        this.riskScore = riskScore;
        this.imagePath = imagePath;
        this.user = user;
    }
}
