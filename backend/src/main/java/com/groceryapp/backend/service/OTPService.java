package com.groceryapp.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
@Slf4j
public class OTPService {
    
    private final EmailService emailService;
    
    // In-memory storage for OTPs (in production, use Redis or database)
    private final Map<String, OTPData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    public OTPService(EmailService emailService) {
        this.emailService = emailService;
    }
    
    public String generateOTP(String email) {
        // Generate a 6-digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        
        // Store OTP with expiration time (5 minutes)
        long expirationTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
        OTPData otpData = new OTPData(otp, expirationTime);
        otpStorage.put(email, otpData);
        
        log.info("OTP generated for email: {}", email);
        return otp;
    }
    
    public void sendOTPEmail(String email, String userName) {
        try {
            // Get the stored OTP
            OTPData otpData = otpStorage.get(email);
            if (otpData != null) {
                // Send email with OTP
                emailService.sendOTPEmail(email, otpData.getOtp(), userName);
                log.info("OTP email sent to: {}", email);
            } else {
                log.warn("No OTP found for email: {}", email);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", email, e);
        }
    }
    
    public boolean verifyOTP(String email, String otp) {
        OTPData storedData = otpStorage.get(email);
        
        if (storedData == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }
        
        // Check if OTP has expired
        if (System.currentTimeMillis() > storedData.getExpirationTime()) {
            log.warn("OTP expired for email: {}", email);
            otpStorage.remove(email);
            return false;
        }
        
        // Check if OTP matches
        boolean isValid = storedData.getOtp().equals(otp);
        
        if (isValid) {
            // Remove OTP after successful verification
            otpStorage.remove(email);
            log.info("OTP verified successfully for email: {}", email);
        } else {
            log.warn("Invalid OTP provided for email: {}", email);
        }
        
        return isValid;
    }
    
    public boolean resendOTP(String email) {
        // Remove existing OTP if any
        otpStorage.remove(email);
        
        // Generate new OTP
        generateOTP(email);
        log.info("OTP resent for email: {}", email);
        return true;
    }
    
    // Inner class to store OTP data
    private static class OTPData {
        private final String otp;
        private final long expirationTime;
        
        public OTPData(String otp, long expirationTime) {
            this.otp = otp;
            this.expirationTime = expirationTime;
        }
        
        public String getOtp() {
            return otp;
        }
        
        public long getExpirationTime() {
            return expirationTime;
        }
    }
}
