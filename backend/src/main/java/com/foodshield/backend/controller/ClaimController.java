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
            @RequestParam("image") MultipartFile image) {
        try {
            Claim claim = claimService.createClaim(restaurant, amount, image);
            return ResponseEntity.ok(claim);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Claim> getAllClaims() {
        return claimService.getAllClaims();
    }
}
