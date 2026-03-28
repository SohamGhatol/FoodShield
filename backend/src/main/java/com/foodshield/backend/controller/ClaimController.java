package com.foodshield.backend.controller;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    ClaimService claimService;

    @PostMapping
    public ResponseEntity<?> createClaim(
            @RequestParam("restaurant") String restaurant,
            @RequestParam("amount") Double amount,
            @RequestParam("claimantName") String claimantName,
            @RequestParam(value = "complaint", required = false, defaultValue = "") String complaint,
            @RequestParam(value = "image", required = false) List<MultipartFile> images) {
        try {
            Claim claim = claimService.createClaim(restaurant, amount, claimantName, complaint, images);
            return ResponseEntity.ok(claim);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Claim> getAllClaims() {
        return claimService.getAllClaims();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        try {
            Claim claim = claimService.getClaimById(id);
            return ResponseEntity.ok(claim);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateClaimStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body("Status is required");
        }
        try {
            Claim updatedClaim = claimService.updateClaimStatus(id, status);
            return ResponseEntity.ok(updatedClaim);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
