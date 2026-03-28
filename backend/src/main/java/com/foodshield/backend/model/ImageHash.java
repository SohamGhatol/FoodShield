package com.foodshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "image_hashes")
@Data
@NoArgsConstructor
public class ImageHash {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String hash; // Perceptual hash (pHash) string

    @Column(nullable = false)
    private Long claimId;

    private String imageUrl;

    private String username; // Who uploaded this image

    public ImageHash(String hash, Long claimId, String imageUrl, String username) {
        this.hash = hash;
        this.claimId = claimId;
        this.imageUrl = imageUrl;
        this.username = username;
    }
}
