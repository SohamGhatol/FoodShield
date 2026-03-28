package com.foodshield.backend.controller;

import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.UserRepository;
import com.foodshield.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String role = payload.getOrDefault("role", "USER");
        String email = payload.get("email");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Validate role
        if (!List.of("SUPER_ADMIN", "ADMIN", "ANALYST", "USER").contains(role)) {
            return ResponseEntity.badRequest().body("Invalid role. Must be SUPER_ADMIN, ADMIN, ANALYST, or USER");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEmail(email);
        user.setTrustLevel("NEW");
        User saved = userRepository.save(user);

        auditLogService.log("USER_CREATED", "Admin", "User", saved.getId(),
                null, username, "Role: " + role);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newRole = payload.get("role");
        if (!List.of("SUPER_ADMIN", "ADMIN", "ANALYST", "USER").contains(newRole)) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String oldRole = user.getRole();
        user.setRole(newRole);
        userRepository.save(user);

        auditLogService.log("ROLE_CHANGED", "Admin", "User", id,
                oldRole, newRole, "User: " + user.getUsername());

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String username = user.getUsername();
        userRepository.deleteById(id);

        auditLogService.log("USER_DELETED", "Admin", "User", id,
                username, null, "User deleted");

        return ResponseEntity.ok().body("User deleted");
    }
}
