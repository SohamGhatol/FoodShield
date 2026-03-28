package com.foodshield.backend.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String role;
    private String trustLevel;

    public JwtResponse(String accessToken, Long id, String username, String role) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public JwtResponse(String accessToken, Long id, String username, String role, String trustLevel) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.role = role;
        this.trustLevel = trustLevel;
    }
}
