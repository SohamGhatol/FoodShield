package com.foodshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fraud_analysis")
@Data
@NoArgsConstructor
public class FraudAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    private Integer aiScore; // 0-100 (from Image Model)
    private Integer metadataScore; // 0-100 (from EXIF/Metadata)
    private Integer findingScore; // 0-100 (from Historical patterns)

    private Integer finalRiskScore; // Weighted average

    @Column(columnDefinition = "TEXT")
    private String explanation; // JSON or text summary of why it's fraud

    public FraudAnalysis(Claim claim, Integer aiScore, Integer metadataScore, Integer findingScore,
            Integer finalRiskScore, String explanation) {
        this.claim = claim;
        this.aiScore = aiScore;
        this.metadataScore = metadataScore;
        this.findingScore = findingScore;
        this.finalRiskScore = finalRiskScore;
        this.explanation = explanation;
    }
}
