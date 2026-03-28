package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.model.FraudAnalysis;
import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.FraudAnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;

class FraudEngineServiceTest {

    @Mock
    private FraudAnalysisRepository fraudAnalysisRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private MLServiceClient mlServiceClient;

    @Mock
    private SystemConfigService systemConfigService;

    @Mock
    private BlacklistService blacklistService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TrustLevelService trustLevelService;

    @Mock
    private ImageHashService imageHashService;

    @InjectMocks
    private FraudEngineService fraudEngineService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private void setupDefaultTrustLevel() {
        when(trustLevelService.getTrustModifier(any())).thenReturn(1.0);
    }

    @Test
    void analyzeClaim_ShouldGenerateScoresAndSaveAnalysis() {
        // Arrange
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setImageUrl("test_image.jpg");

        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setTrustLevel("NEW");
        claim.setUser(mockUser);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);
        when(fraudAnalysisRepository.save(any(FraudAnalysis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(mlServiceClient.analyzeImage(any()))
                .thenReturn(new MLServiceClient.MLResponse(false, 0.5, true, "Mock Analysis"));

        com.foodshield.backend.model.SystemConfig config = new com.foodshield.backend.model.SystemConfig();
        config.setAutoRejectScore(80);
        config.setManualReviewStart(40);
        when(systemConfigService.getGlobalConfig()).thenReturn(config);

        when(claimRepository.countByUser_UsernameAndStatusIn(eq("testuser"), anyList())).thenReturn(0L);
        when(blacklistService.isBlacklisted("testuser")).thenReturn(false);
        setupDefaultTrustLevel();

        // pHash returns no duplicate
        when(imageHashService.computePerceptualHash(any())).thenReturn(null);

        // Act
        FraudAnalysis result = fraudEngineService.analyzeClaim(claim);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getAiScore());
        assertNotNull(result.getFinalRiskScore());
        assertTrue(result.getCustomerBehaviorAnalysis().contains("Positive Feedback"));

        verify(blacklistService, never()).addToBlacklist(any(), any(), any());
        verify(auditLogService).log(eq("FRAUD_ANALYZED"), any(), any(), any(), any(), any(), any());
    }

    @Test
    void analyzeClaim_WithFrequentFraud_ShouldAutoBlacklist() {
        // Arrange
        Claim claim = new Claim();
        claim.setId(2L);
        User mockUser = new User();
        mockUser.setUsername("fraudster");
        mockUser.setTrustLevel("NEW");
        claim.setUser(mockUser);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);
        when(fraudAnalysisRepository.save(any(FraudAnalysis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Setup threshold triggering behavior
        when(blacklistService.isBlacklisted("fraudster")).thenReturn(false).thenReturn(true);
        when(claimRepository.countByUser_UsernameAndStatusIn(eq("fraudster"), anyList())).thenReturn(3L);
        setupDefaultTrustLevel();

        // Act
        FraudAnalysis result = fraudEngineService.analyzeClaim(claim);

        // Assert
        assertNotNull(result);
        assertEquals(100, result.getFinalRiskScore());
        assertEquals("REJECTED", claim.getStatus());
        assertTrue(result.getCustomerBehaviorAnalysis().contains("severe history"));

        // Verify ML was skipped (blacklisted after auto-blacklist)
        verify(mlServiceClient, never()).analyzeImage(any());

        // Verify they were added to blacklist
        verify(blacklistService, times(1)).addToBlacklist(eq("fraudster"), any(), eq("System"));
        verify(auditLogService).log(eq("AUTO_BLACKLISTED"), any(), any(), any(), any(), any(), any());
    }

    @Test
    void analyzeClaim_AlreadyBlacklisted_ShouldInstantlyReject() {
        // Arrange
        Claim claim = new Claim();
        claim.setId(3L);
        User mockUser = new User();
        mockUser.setUsername("badactor");
        mockUser.setTrustLevel("NEW");
        claim.setUser(mockUser);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);
        when(fraudAnalysisRepository.save(any(FraudAnalysis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(blacklistService.isBlacklisted("badactor")).thenReturn(true);
        setupDefaultTrustLevel();

        // Act
        FraudAnalysis result = fraudEngineService.analyzeClaim(claim);

        // Assert
        assertEquals(100, result.getFinalRiskScore());
        assertEquals("REJECTED", claim.getStatus());
        assertTrue(result.getCustomerBehaviorAnalysis().contains("currently blacklisted"));

        verify(claimRepository, never()).countByUser_UsernameAndStatusIn(any(), anyList());
        verify(mlServiceClient, never()).analyzeImage(any());
    }

    @Test
    void analyzeClaim_DuplicateImage_ShouldBoostScore() {
        // Arrange
        Claim claim = new Claim();
        claim.setId(4L);
        claim.setImageUrl("duplicate_test.jpg");

        User mockUser = new User();
        mockUser.setUsername("dupuser");
        mockUser.setTrustLevel("NEW");
        claim.setUser(mockUser);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);
        when(fraudAnalysisRepository.save(any(FraudAnalysis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(mlServiceClient.analyzeImage(any()))
                .thenReturn(new MLServiceClient.MLResponse(false, 0.9, true, "Mock"));

        com.foodshield.backend.model.SystemConfig config = new com.foodshield.backend.model.SystemConfig();
        config.setAutoRejectScore(80);
        config.setManualReviewStart(40);
        when(systemConfigService.getGlobalConfig()).thenReturn(config);

        when(claimRepository.countByUser_UsernameAndStatusIn(eq("dupuser"), anyList())).thenReturn(0L);
        when(blacklistService.isBlacklisted("dupuser")).thenReturn(false);
        setupDefaultTrustLevel();

        // pHash returns duplicate match
        String fakeHash = "1010101010101010101010101010101010101010101010101010101010101010";
        when(imageHashService.computePerceptualHash(any())).thenReturn(fakeHash);
        when(imageHashService.checkForDuplicates(eq(fakeHash), eq(4L)))
                .thenReturn(new ImageHashService.DuplicateCheckResult(true, 1L, 3));

        // Act
        FraudAnalysis result = fraudEngineService.analyzeClaim(claim);

        // Assert
        assertNotNull(result);
        assertTrue(result.getDuplicateImageDetected());
        assertEquals(1L, result.getDuplicateClaimId());
        assertTrue(result.getExplanation().contains("DUPLICATE IMAGE"));

        verify(auditLogService).log(eq("DUPLICATE_IMAGE"), any(), any(), any(), any(), any(), any());
    }
}
