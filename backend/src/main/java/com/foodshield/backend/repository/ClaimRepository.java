package com.foodshield.backend.repository;

import com.foodshield.backend.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByStatus(String status);

    List<Claim> findAllByOrderByCreatedAtDesc();
}
