package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ClaimService {

    @Autowired
    ClaimRepository claimRepository;

    @Autowired
    com.foodshield.backend.repository.UserRepository userRepository;

    @Autowired
    FraudEngineService fraudEngineService;

    private final Path rootLocation = Paths.get("uploads");

    public Claim createClaim(String restaurantName, Double amount, MultipartFile file) throws IOException {
        // 1. Save Image
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path destinationFile = rootLocation.resolve(filename);
        Files.copy(file.getInputStream(), destinationFile);

        // 2. Get Current User
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        com.foodshield.backend.model.User user = userRepository.findByUsername(username).orElse(null);

        // 3. Create Claim
        Claim claim = new Claim(restaurantName, amount, "ANALYZING", 0, destinationFile.toString(), user);

        // 4. Save to DB
        claim = claimRepository.save(claim);

        // 5. Trigger Fraud Analysis (Synchronous for now)
        fraudEngineService.analyzeClaim(claim);

        return claim;
    }

    public java.util.List<Claim> getAllClaims() {
        return claimRepository.findAllByOrderByCreatedAtDesc();
    }
}
