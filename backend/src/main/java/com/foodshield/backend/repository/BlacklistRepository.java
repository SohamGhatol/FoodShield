package com.foodshield.backend.repository;

import com.foodshield.backend.model.BlacklistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BlacklistRepository extends JpaRepository<BlacklistEntry, Long> {
    Optional<BlacklistEntry> findByUsername(String username);

    boolean existsByUsername(String username);
}
