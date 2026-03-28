package com.foodshield.backend.repository;

import com.foodshield.backend.model.ImageHash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageHashRepository extends JpaRepository<ImageHash, Long> {
    List<ImageHash> findByHash(String hash);
    List<ImageHash> findByClaimId(Long claimId);
    boolean existsByHashAndClaimIdNot(String hash, Long claimId);
}
