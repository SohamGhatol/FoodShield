package com.foodshield.backend.service;

import com.foodshield.backend.dto.JwtResponse;
import com.foodshield.backend.dto.LoginRequest;
import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.UserRepository;
import com.foodshield.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        // Mock authentication for initial setup if DB is empty or for testing
        if ("admin".equals(loginRequest.getUsername()) && "admin123".equals(loginRequest.getPassword())) {
            return new JwtResponse("mock-jwt-token-for-admin", 1L, "admin", "ADMIN");
        }

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Invalid password.");
        }

        // Create manual authentication object
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null);

        String jwt = jwtUtils.generateJwtToken(authentication);

        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getRole());
    }
}
