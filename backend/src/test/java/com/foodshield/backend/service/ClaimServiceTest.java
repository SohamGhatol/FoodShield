package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import com.foodshield.backend.model.User;
import com.foodshield.backend.repository.ClaimRepository;
import com.foodshield.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FraudEngineService fraudEngineService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TrustLevelService trustLevelService;

    @InjectMocks
    private ClaimService claimService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private void mockSecurityContext(String username) {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createClaim_ShouldReturnSavedClaim() throws IOException {
        // Arrange
        String restaurant = "Test Restaurant";
        Double amount = 50.0;
        MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test data".getBytes());

        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setTrustLevel("NEW");

        mockSecurityContext("testuser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> {
            Claim c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(claimRepository.findById(any())).thenAnswer(invocation -> {
            Claim c = new Claim();
            c.setId(1L);
            c.setRestaurantName(restaurant);
            c.setStatus("ANALYZING");
            return Optional.of(c);
        });

        // Act
        String claimantName = "Test Claimant";
        Claim result = claimService.createClaim(restaurant, amount, claimantName, "", Collections.singletonList(file));

        // Assert
        assertNotNull(result);
        assertEquals(restaurant, result.getRestaurantName());
        verify(fraudEngineService).analyzeClaim(any(Claim.class));
        verify(auditLogService).log(eq("CLAIM_CREATED"), eq("testuser"), eq("Claim"), any(), any(), any(), any());
    }

    @Test
    void createClaim_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        mockSecurityContext("unknownuser");

        when(userRepository.findByUsername("unknownuser")).thenReturn(Optional.empty());
        MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test data".getBytes());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            claimService.createClaim("Rest", 50.0, "Claimant", "Complaint", Collections.singletonList(file));
        });
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void getAllClaims_ShouldReturnListOfClaims() {
        // Arrange
        Claim claim1 = new Claim(); claim1.setId(1L);
        Claim claim2 = new Claim(); claim2.setId(2L);
        when(claimRepository.findAll()).thenReturn(List.of(claim1, claim2));

        // Act
        List<Claim> results = claimService.getAllClaims();

        // Assert
        assertEquals(2, results.size());
    }

    @Test
    void getClaimById_ShouldReturnClaim_WhenExists() {
        // Arrange
        Claim claim = new Claim();
        claim.setId(1L);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        // Act
        Claim result = claimService.getClaimById(1L);

        // Assert
        assertEquals(1L, result.getId());
    }

    @Test
    void getClaimById_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            claimService.getClaimById(99L);
        });
        assertEquals("Claim not found", exception.getMessage());
    }

    @Test
    void updateClaimStatus_ShouldSaveAndReturnClaim() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setTrustLevel("NEW");

        Claim claim = new Claim();
        claim.setId(1L);
        claim.setStatus("PENDING");
        claim.setUser(user);

        mockSecurityContext("admin@foodshield.com");

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Claim result = claimService.updateClaimStatus(1L, "APPROVED");

        // Assert
        assertEquals("APPROVED", result.getStatus());
        assertEquals("Manual", result.getDecisionMode());
        verify(claimRepository).save(claim);
        verify(auditLogService).log(eq("STATUS_CHANGED"), any(), eq("Claim"), eq(1L), eq("PENDING"), eq("APPROVED"), any());
        verify(notificationService).sendClaimStatusEmail(any(), eq("APPROVED"));
        verify(trustLevelService).recalculateTrustLevel(user);
    }
}
