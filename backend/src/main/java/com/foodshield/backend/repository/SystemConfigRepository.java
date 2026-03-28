package com.foodshield.backend.repository;

import com.foodshield.backend.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    // We only need one row, so findFirst is sufficient
    SystemConfig findTopByOrderByIdAsc();
}
