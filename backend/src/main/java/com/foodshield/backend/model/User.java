package com.foodshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Hashed

    private String role; // "ADMIN", "USER"

    private String email;

    private String trustLevel; // "PLATINUM", "GOLD", "SILVER", "BRONZE", "NEW"

    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.trustLevel = "NEW";
    }
}
