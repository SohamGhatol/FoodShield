package com.foodshield.backend.service;

import com.foodshield.backend.model.ImageHash;
import com.foodshield.backend.repository.ImageHashRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.List;

@Service
public class ImageHashService {

    @Autowired
    private ImageHashRepository imageHashRepository;

    /**
     * Compute a simplified perceptual hash (pHash) of an image.
     * Algorithm: Resize to 8x8 grayscale, compute DCT-like average, produce 64-bit hash string.
     */
    public String computePerceptualHash(String imagePath) {
        try {
            File imgFile = new File(imagePath);
            if (!imgFile.exists()) return null;

            BufferedImage original = ImageIO.read(imgFile);
            if (original == null) return null;

            // Resize to 8x8
            BufferedImage resized = new BufferedImage(8, 8, BufferedImage.TYPE_BYTE_GRAY);
            Graphics2D g2d = resized.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.drawImage(original, 0, 0, 8, 8, null);
            g2d.dispose();

            // Compute average pixel value
            double totalPixel = 0;
            int[] pixels = new int[64];
            for (int y = 0; y < 8; y++) {
                for (int x = 0; x < 8; x++) {
                    int gray = resized.getRGB(x, y) & 0xFF;
                    pixels[y * 8 + x] = gray;
                    totalPixel += gray;
                }
            }
            double avg = totalPixel / 64.0;

            // Build binary hash: 1 if pixel > average, 0 otherwise
            StringBuilder hashBuilder = new StringBuilder();
            for (int p : pixels) {
                hashBuilder.append(p > avg ? "1" : "0");
            }

            return hashBuilder.toString();
        } catch (Exception e) {
            System.err.println("[pHash] Error computing hash: " + e.getMessage());
            return null;
        }
    }

    /**
     * Compute Hamming distance between two hash strings.
     * Lower distance = more similar images.
     */
    public int hammingDistance(String hash1, String hash2) {
        if (hash1 == null || hash2 == null || hash1.length() != hash2.length()) {
            return Integer.MAX_VALUE;
        }
        int distance = 0;
        for (int i = 0; i < hash1.length(); i++) {
            if (hash1.charAt(i) != hash2.charAt(i)) {
                distance++;
            }
        }
        return distance;
    }

    /**
     * Store a hash for a claim image.
     */
    public void storeHash(String hash, Long claimId, String imageUrl, String username) {
        if (hash == null) return;
        ImageHash imageHash = new ImageHash(hash, claimId, imageUrl, username);
        imageHashRepository.save(imageHash);
    }

    /**
     * Check if an image has duplicates across other claims.
     * Returns list of matching claim IDs where the image was previously used.
     * Threshold: Hamming distance <= 10 out of 64 (84%+ similar).
     */
    public DuplicateCheckResult checkForDuplicates(String hash, Long currentClaimId) {
        if (hash == null) return new DuplicateCheckResult(false, null, 0);

        List<ImageHash> allHashes = imageHashRepository.findAll();
        
        for (ImageHash stored : allHashes) {
            // Skip hashes from the same claim
            if (stored.getClaimId().equals(currentClaimId)) continue;

            int distance = hammingDistance(hash, stored.getHash());
            if (distance <= 10) { // Threshold: 84%+ similarity
                return new DuplicateCheckResult(true, stored.getClaimId(), distance);
            }
        }

        return new DuplicateCheckResult(false, null, 0);
    }

    /**
     * Result of a duplicate check.
     */
    public static class DuplicateCheckResult {
        public final boolean isDuplicate;
        public final Long matchedClaimId;
        public final int hammingDistance;

        public DuplicateCheckResult(boolean isDuplicate, Long matchedClaimId, int hammingDistance) {
            this.isDuplicate = isDuplicate;
            this.matchedClaimId = matchedClaimId;
            this.hammingDistance = hammingDistance;
        }
    }
}
