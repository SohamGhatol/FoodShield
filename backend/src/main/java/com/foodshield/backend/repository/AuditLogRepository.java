package com.foodshield.backend.repository;

import com.foodshield.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
    List<AuditLog> findAllByOrderByTimestampDesc();

    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :fromDate AND :toDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByDateRange(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    List<AuditLog> findByTargetEntityAndTargetEntityIdOrderByTimestampDesc(
        String targetEntity, Long targetEntityId);
}
