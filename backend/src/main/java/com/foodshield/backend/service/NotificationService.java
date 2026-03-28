package com.foodshield.backend.service;

import com.foodshield.backend.model.Claim;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${foodshield.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${foodshield.email.from:noreply@foodshield.com}")
    private String fromAddress;

    @Async
    public void sendClaimStatusEmail(Claim claim, String newStatus) {
        if (!emailEnabled) {
            System.out.println("[Email] Disabled — would send " + newStatus + " email for claim #" + claim.getId());
            return;
        }

        try {
            String recipientEmail = claim.getUser() != null ? claim.getUser().getEmail() : null;
            if (recipientEmail == null || recipientEmail.isBlank()) {
                System.out.println("[Email] No email address for user, skipping notification.");
                return;
            }

            String templateName;
            String subject;

            switch (newStatus) {
                case "SAFE":
                    templateName = "claim-approved";
                    subject = "FoodShield — Your Claim #" + claim.getId() + " Has Been Approved ✓";
                    break;
                case "REJECTED":
                case "HIGH_RISK":
                    templateName = "claim-rejected";
                    subject = "FoodShield — Update on Your Claim #" + claim.getId();
                    break;
                case "REVIEW":
                    templateName = "claim-review";
                    subject = "FoodShield — Your Claim #" + claim.getId() + " Is Under Review";
                    break;
                default:
                    templateName = "claim-status-update";
                    subject = "FoodShield — Claim #" + claim.getId() + " Status Update";
                    break;
            }

            Context context = new Context();
            context.setVariable("claim", claim);
            context.setVariable("status", newStatus);
            context.setVariable("claimantName", claim.getClaimantName() != null ? claim.getClaimantName() : "Valued Customer");
            context.setVariable("restaurantName", claim.getRestaurantName());
            context.setVariable("amount", claim.getAmount());
            context.setVariable("claimId", claim.getId());

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[Email] Sent " + newStatus + " notification to " + recipientEmail);

        } catch (Exception e) {
            System.err.println("[Email] Failed to send notification: " + e.getMessage());
        }
    }
}
