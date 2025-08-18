package com.groceryapp.backend.controller;

import com.groceryapp.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendTestEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("to");
            String subject = request.get("subject");
            String text = request.get("text");

            if (to == null || subject == null || text == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: to, subject, text"
                ));
            }

            emailService.sendSimpleEmail(to, subject, text);
            
            return ResponseEntity.ok(Map.of(
                "message", "Test email sent successfully",
                "to", to,
                "subject", subject
            ));
        } catch (Exception e) {
            log.error("Error sending test email", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send test email: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/welcome")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendWelcomeEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");

            if (email == null || firstName == null || lastName == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: email, firstName, lastName"
                ));
            }

            // Create a mock user for testing
            var user = com.groceryapp.backend.model.User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .build();

            emailService.sendWelcomeEmail(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Welcome email sent successfully",
                "to", email
            ));
        } catch (Exception e) {
            log.error("Error sending welcome email", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send welcome email: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/promotional")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendPromotionalEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String subject = request.get("subject");
            String content = request.get("content");
            String ctaUrl = request.get("ctaUrl");
            String ctaText = request.get("ctaText");

            if (email == null || firstName == null || lastName == null || 
                subject == null || content == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: email, firstName, lastName, subject, content"
                ));
            }

            // Create a mock user for testing
            var user = com.groceryapp.backend.model.User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .build();

            emailService.sendPromotionalEmail(user, subject, content, ctaUrl, ctaText);
            
            return ResponseEntity.ok(Map.of(
                "message", "Promotional email sent successfully",
                "to", email,
                "subject", subject
            ));
        } catch (Exception e) {
            log.error("Error sending promotional email", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send promotional email: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> emailHealthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "Email service is running",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}
