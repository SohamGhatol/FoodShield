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

        String actionUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(actionUser).orElse(null);
        if (currentUser != null && "ADMIN".equals(currentUser.getRole()) && "SUPER_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("ADMIN cannot create a SUPER_ADMIN");
        }

        auditLogService.log("USER_CREATED", actionUser, "User", saved.getId(),
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

        String actionUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(actionUser).orElse(null);

        if (currentUser != null && "ADMIN".equals(currentUser.getRole()) && "SUPER_ADMIN".equals(oldRole)) {
            return ResponseEntity.status(403).body("ADMIN cannot modify a SUPER_ADMIN");
        }
        if (currentUser != null && "ADMIN".equals(currentUser.getRole()) && "SUPER_ADMIN".equals(newRole)) {
            return ResponseEntity.status(403).body("ADMIN cannot promote to SUPER_ADMIN");
        }
        if (user.getUsername().equals(actionUser) && !newRole.equals(oldRole)) {
            return ResponseEntity.status(403).body("You cannot change your own role");
        }

        user.setRole(newRole);
        userRepository.save(user);

        auditLogService.log("ROLE_CHANGED", actionUser, "User", id,
                oldRole, newRole, "User: " + user.getUsername());

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String actionUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(actionUser).orElse(null);

        if (user.getUsername().equals(actionUser)) {
            return ResponseEntity.status(403).body("You cannot delete yourself");
        }
        if (currentUser != null && "ADMIN".equals(currentUser.getRole()) && "SUPER_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("ADMIN cannot delete a SUPER_ADMIN");
        }

        String username = user.getUsername();
        userRepository.deleteById(id);

        auditLogService.log("USER_DELETED", actionUser, "User", id,
                username, null, "User deleted");

        return ResponseEntity.ok().body("User deleted");
    }
}
