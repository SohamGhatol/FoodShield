package com.foodshield.backend.controller;

import com.foodshield.backend.model.AuditLog;
import com.foodshield.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<AuditLog> getAllLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) Long entityId) {
        if (entity != null && entityId != null) return auditLogService.getLogsForEntity(entity, entityId);
        if (action != null && !action.isEmpty()) return auditLogService.getLogsByAction(action);
        if (user != null && !user.isEmpty()) return auditLogService.getLogsByUser(user);
        return auditLogService.getAllLogs();
    }

    @GetMapping("/entity/{entity}/{id}")
    public List<AuditLog> getLogsForEntity(@PathVariable String entity, @PathVariable Long id) {
        return auditLogService.getLogsForEntity(entity, id);
    }
}
