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
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    private String restaurantName;
    private String claimantName;
    private Double amount;

    @Column(columnDefinition = "TEXT")
    private String complaint;

    private String status;
    private String decisionMode; // "Manual" or "Automated"
    private Integer riskScore;

    // Mapped to 'image_url' in JSON, 'imagePath' in DB
    private String imageUrl;

    @OneToOne(mappedBy = "claim", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private FraudAnalysis fraudAnalysis;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Claim(String restaurantName, Double amount, String status, Integer riskScore, String imageUrl, User user) {
        this.restaurantName = restaurantName;
        this.amount = amount;
        this.status = status;
        this.riskScore = riskScore;
        this.imageUrl = imageUrl;
        this.user = user;
    }
}
