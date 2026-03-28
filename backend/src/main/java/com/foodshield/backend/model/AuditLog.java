package com.foodshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    private String targetEntity;
    private Long targetEntityId;

    private String oldValue;
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public AuditLog(String action, String performedBy, String targetEntity,
                    Long targetEntityId, String oldValue, String newValue, String details) {
        this.action = action;
        this.performedBy = performedBy;
        this.targetEntity = targetEntity;
        this.targetEntityId = targetEntityId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.details = details;
    }
}
