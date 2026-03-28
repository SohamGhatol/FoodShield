package com.foodshield.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer autoRejectScore;
    private Integer manualReviewStart;
    private Integer manualReviewEnd;
    private Integer dataRetentionDays;
    private boolean emailAlertsEnabled;
    private boolean slackIntegrationEnabled;

    private LocalDateTime updatedAt;

    public SystemConfig() {
        // Default values
        this.autoRejectScore = 80;
        this.manualReviewStart = 40;
        this.manualReviewEnd = 79;
        this.dataRetentionDays = 30;
        this.emailAlertsEnabled = true;
        this.slackIntegrationEnabled = false;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getAutoRejectScore() {
        return autoRejectScore;
    }

    public void setAutoRejectScore(Integer autoRejectScore) {
        this.autoRejectScore = autoRejectScore;
    }

    public Integer getManualReviewStart() {
        return manualReviewStart;
    }

    public void setManualReviewStart(Integer manualReviewStart) {
        this.manualReviewStart = manualReviewStart;
    }

    public Integer getManualReviewEnd() {
        return manualReviewEnd;
    }

    public void setManualReviewEnd(Integer manualReviewEnd) {
        this.manualReviewEnd = manualReviewEnd;
    }

    public Integer getDataRetentionDays() {
        return dataRetentionDays;
    }

    public void setDataRetentionDays(Integer dataRetentionDays) {
        this.dataRetentionDays = dataRetentionDays;
    }

    public boolean isEmailAlertsEnabled() {
        return emailAlertsEnabled;
    }

    public void setEmailAlertsEnabled(boolean emailAlertsEnabled) {
        this.emailAlertsEnabled = emailAlertsEnabled;
    }

    public boolean isSlackIntegrationEnabled() {
        return slackIntegrationEnabled;
    }

    public void setSlackIntegrationEnabled(boolean slackIntegrationEnabled) {
        this.slackIntegrationEnabled = slackIntegrationEnabled;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
