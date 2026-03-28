package com.foodshield.backend.service;

import com.foodshield.backend.model.AuditLog;
import com.foodshield.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Async
    public void log(String action, String performedBy, String targetEntity,
                    Long targetEntityId, String oldValue, String newValue, String details) {
        AuditLog auditLog = new AuditLog(action, performedBy, targetEntity,
                                          targetEntityId, oldValue, newValue, details);
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    public List<AuditLog> getLogsByUser(String username) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(username);
    }

    public List<AuditLog> getLogsForEntity(String entity, Long entityId) {
        return auditLogRepository.findByTargetEntityAndTargetEntityIdOrderByTimestampDesc(entity, entityId);
    }
}
