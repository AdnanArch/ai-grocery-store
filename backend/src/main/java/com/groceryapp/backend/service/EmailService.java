package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:thedynamiccoder@gmail.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // Constructor to check if email is properly configured
    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        
        // Check if email is properly configured
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Email functionality will be disabled.");
        } else {
            log.info("EmailService initialized successfully");
            log.info("Email will be sent from: {}", fromEmail);
            
            // Check if email credentials are properly set
            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                log.warn("Email username/password not configured. OTP codes will be logged instead of sent via email.");
            }
        }
    }

    @Async
    public void sendOrderConfirmationEmail(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getId());

            // Prepare template context
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("user", user);
            context.setVariable("orderItems", order.getItems());
            context.setVariable("totalAmount", order.getTotalAmount());
            context.setVariable("orderDate", order.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
            context.setVariable("orderNumber", order.getId());
            context.setVariable("trackingUrl", frontendUrl + "/orders");

            String htmlContent = templateEngine.process("order-confirmation", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Order confirmation email sent to {} for order #{}", user.getEmail(), order.getId());

        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email to {} for order #{}", user.getEmail(), order.getId(), e);
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request");

            // Prepare template context
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("resetUrl", frontendUrl + "/reset-password/" + resetToken);
            context.setVariable("expiryHours", 24);

            String htmlContent = templateEngine.process("password-reset", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to FreshCart!");

            // Prepare template context
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("shopUrl", frontendUrl + "/shop");
            context.setVariable("accountUrl", frontendUrl + "/account");

            String htmlContent = templateEngine.process("welcome", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent to {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendOrderStatusUpdateEmail(Order order, User user, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Order Status Update - Order #" + order.getId());

            // Prepare template context
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("user", user);
            context.setVariable("newStatus", newStatus);
            context.setVariable("orderNumber", order.getId());
            context.setVariable("trackingUrl", frontendUrl + "/orders");

            String htmlContent = templateEngine.process("order-status-update", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Order status update email sent to {} for order #{}", user.getEmail(), order.getId());

        } catch (MessagingException e) {
            log.error("Failed to send order status update email to {} for order #{}", user.getEmail(), order.getId(), e);
        }
    }

    @Async
    public void sendPromotionalEmail(User user, String subject, String content, String ctaUrl, String ctaText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);

            // Prepare template context
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("content", content);
            context.setVariable("ctaUrl", ctaUrl);
            context.setVariable("ctaText", ctaText);
            context.setVariable("unsubscribeUrl", frontendUrl + "/account/email-preferences");

            String htmlContent = templateEngine.process("promotional", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Promotional email sent to {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send promotional email to {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendLowStockAlertEmail(String productName, int currentStock, int threshold) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo("admin@grocerystore.com"); // Admin email
            helper.setSubject("Low Stock Alert - " + productName);

            // Prepare template context
            Context context = new Context();
            context.setVariable("productName", productName);
            context.setVariable("currentStock", currentStock);
            context.setVariable("threshold", threshold);
            context.setVariable("adminUrl", frontendUrl + "/admin");

            String htmlContent = templateEngine.process("low-stock-alert", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Low stock alert email sent for product: {}", productName);

        } catch (MessagingException e) {
            log.error("Failed to send low stock alert email for product: {}", productName, e);
        }
    }

    @Async
    public void sendDailySalesReportEmail(Map<String, Object> salesData) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo("admin@grocerystore.com");
            helper.setSubject("Daily Sales Report - " + salesData.get("date"));

            // Prepare template context
            Context context = new Context();
            context.setVariable("salesData", salesData);
            context.setVariable("adminUrl", frontendUrl + "/admin");

            String htmlContent = templateEngine.process("daily-sales-report", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Daily sales report email sent");

        } catch (MessagingException e) {
            log.error("Failed to send daily sales report email", e);
        }
    }

    @Async
    public void sendPaymentConfirmationEmail(Order order, User user, String transactionId, String paymentMethod) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Payment Confirmation - Order #" + order.getId());

            // Prepare template context
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("user", user);
            context.setVariable("orderItems", order.getItems());
            context.setVariable("totalAmount", order.getTotalAmount());
            context.setVariable("orderDate", order.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
            context.setVariable("orderNumber", order.getId());
            context.setVariable("transactionId", transactionId);
            context.setVariable("paymentMethod", paymentMethod);
            context.setVariable("trackingUrl", frontendUrl + "/orders");
            context.setVariable("currency", "PKR");

            String htmlContent = templateEngine.process("payment-confirmation", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Payment confirmation email sent to {} for order #{}", user.getEmail(), order.getId());

        } catch (MessagingException e) {
            log.error("Failed to send payment confirmation email to {} for order #{}", user.getEmail(), order.getId(), e);
        }
    }

    // Simple text email for testing
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);

            mailSender.send(message);
            log.info("Simple email sent to {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send simple email to {}", to, e);
        }
    }

    @Async
    public void sendOTPEmail(String email, String otp, String userName) {
        try {
            // Check if email is properly configured
            if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
                log.warn("Email service not properly configured. OTP will be logged instead of sent.");
                log.info("OTP for {}: {}", email, otp);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Your Verification Code - FreshCart");

            // Prepare template context
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("userName", userName);
            context.setVariable("expiryMinutes", 5);
            context.setVariable("appName", "FreshCart");

            String htmlContent = templateEngine.process("otp-verification", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent to {}", email);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", email, e);
            // Log the OTP instead of failing
            log.info("OTP for {}: {}", email, otp);
        } catch (Exception e) {
            log.error("Unexpected error sending OTP email to {}", email, e);
            // Log the OTP instead of failing
            log.info("OTP for {}: {}", email, otp);
        }
    }

    // Fallback method for OTP email (simple text)
    private void sendSimpleOTPEmail(String email, String otp) {
        try {
            String subject = "Your Verification Code - FreshCart";
            String text = String.format(
                "Your verification code is: %s\n\n" +
                "This code will expire in 5 minutes.\n\n" +
                "If you didn't request this code, please ignore this email.\n\n" +
                "Best regards,\nFreshCart Team",
                otp
            );

            sendSimpleEmail(email, subject, text);
        } catch (Exception e) {
            log.error("Failed to send simple OTP email to {}", email, e);
        }
    }
}
