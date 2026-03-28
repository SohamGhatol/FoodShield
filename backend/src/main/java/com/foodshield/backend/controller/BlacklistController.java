package com.foodshield.backend.controller;

import com.foodshield.backend.model.BlacklistEntry;
import com.foodshield.backend.service.BlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/blacklist")
public class BlacklistController {

    @Autowired
    private BlacklistService blacklistService;

    @GetMapping
    public List<BlacklistEntry> getBlacklist() {
        return blacklistService.getAllBlacklistedUsers();
    }

    @PostMapping
    public ResponseEntity<?> addToBlacklist(@RequestBody BlacklistRequest request) {
        if (request.getUsername() == null || request.getReason() == null) {
            return ResponseEntity.badRequest().body("Username and Reason are required");
        }

        try {
            // In a real app, 'addedBy' would come from SecurityContext
            return ResponseEntity
                    .ok(blacklistService.addToBlacklist(request.getUsername(), request.getReason(), "Admin"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromBlacklist(@PathVariable Long id) {
        blacklistService.removeFromBlacklist(id);
        return ResponseEntity.ok().build();
    }

    // DTO for request
    public static class BlacklistRequest {
        private String username;
        private String reason;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
