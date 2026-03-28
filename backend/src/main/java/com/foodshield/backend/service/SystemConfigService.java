package com.foodshield.backend.service;

import com.foodshield.backend.model.SystemConfig;
import com.foodshield.backend.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SystemConfigService {

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    public SystemConfig getGlobalConfig() {
        SystemConfig config = systemConfigRepository.findTopByOrderByIdAsc();
        if (config == null) {
            // Create default if not exists
            config = new SystemConfig();
            systemConfigRepository.save(config);
        }
        return config;
    }

    public SystemConfig updateGlobalConfig(SystemConfig newConfig) {
        SystemConfig existing = getGlobalConfig();

        existing.setAutoRejectScore(newConfig.getAutoRejectScore());
        existing.setManualReviewStart(newConfig.getManualReviewStart());
        existing.setManualReviewEnd(newConfig.getManualReviewEnd());
        existing.setDataRetentionDays(newConfig.getDataRetentionDays());
        existing.setEmailAlertsEnabled(newConfig.isEmailAlertsEnabled());
        existing.setSlackIntegrationEnabled(newConfig.isSlackIntegrationEnabled());
        existing.setUpdatedAt(java.time.LocalDateTime.now());

        return systemConfigRepository.save(existing);
    }
}
