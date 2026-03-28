package com.foodshield.backend.service;

import com.foodshield.backend.model.BlacklistEntry;
import com.foodshield.backend.repository.BlacklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BlacklistService {

    @Autowired
    private BlacklistRepository blacklistRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<BlacklistEntry> getAllBlacklistedUsers() {
        return blacklistRepository.findAll();
    }

    public BlacklistEntry addToBlacklist(String username, String reason, String addedBy) {
        if (blacklistRepository.existsByUsername(username)) {
            throw new RuntimeException("User is already blacklisted");
        }
        BlacklistEntry entry = new BlacklistEntry(username, reason, addedBy);
        BlacklistEntry saved = blacklistRepository.save(entry);

        auditLogService.log("USER_BLACKLISTED", addedBy, "Blacklist", saved.getId(),
                null, username, "Reason: " + reason);

        return saved;
    }

    public void removeFromBlacklist(Long id) {
        BlacklistEntry entry = blacklistRepository.findById(id).orElse(null);
        String username = entry != null ? entry.getUsername() : "unknown";
        blacklistRepository.deleteById(id);

        auditLogService.log("USER_UNBLACKLISTED", "Admin", "Blacklist", id,
                username, null, "Blacklist entry removed");
    }

    public boolean isBlacklisted(String username) {
        return blacklistRepository.existsByUsername(username);
    }
}
