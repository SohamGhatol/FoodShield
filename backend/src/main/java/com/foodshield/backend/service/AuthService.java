package com.foodshield.backend.service;

import com.foodshield.backend.dto.JwtResponse;
import com.foodshield.backend.dto.LoginRequest;
import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.UserRepository;
import com.foodshield.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    // In a real app, AuthenticationManager would be injected here,
    // but for simplicity we might just check passwords manually if AuthManager
    // setup is too complex for this phase.
    // However, sticking to standard Spring Security is better.
    // I need to define AuthenticationManager bean in SecurityConfig.

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // Normalize "admin" to the full email
        String usernameInput = loginRequest.getUsername();
        if ("admin".equals(usernameInput)) {
            usernameInput = "admin@foodshield.com";
        }

        // Auto-create admin if it doesn't exist (for demo purposes)
        // Check for specific hardcoded credentials to trigger creation
        String targetEmail = "admin@foodshield.com";
        if (targetEmail.equals(usernameInput) && "admin".equals(loginRequest.getPassword())) {
            if (userRepository.findByUsername(targetEmail).isEmpty()) {
                User admin = new User();
                admin.setUsername(targetEmail);
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("SUPER_ADMIN");
                admin.setTrustLevel("PLATINUM");
                admin.setEmail(targetEmail);
                userRepository.save(admin);
            }
        }

        User user = userRepository.findByUsername(usernameInput)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Invalid password.");
        }

        String jwt = jwtUtils.generateJwtToken(
                new UsernamePasswordAuthenticationToken(user.getUsername(), null));

        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getRole(), user.getTrustLevel());
    }
}
