package com.foodshield.backend.repository;

import com.foodshield.backend.model.FraudAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FraudAnalysisRepository extends JpaRepository<FraudAnalysis, Long> {
    Optional<FraudAnalysis> findByClaimId(Long claimId);
}
