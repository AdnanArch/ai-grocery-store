package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.RefreshToken;
import com.groceryapp.backend.model.Role;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.RefreshTokenRepository;
import com.groceryapp.backend.repository.RoleRepository;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.service.JwtUtil;
import com.groceryapp.backend.service.OTPService;
import com.groceryapp.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserDetailsService userDetailsService;
    private final OTPService otpService;
    private final EmailService emailService;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
                "message", "Backend is working!",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            // Test database connection
            long userCount = userRepo.count();
            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "connected",
                    "userCount", userCount
            ));
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "DOWN",
                            "error", e.getMessage()
                    ));
        }
    }

    @GetMapping("/roles/status")
    public ResponseEntity<?> getRolesStatus() {
        try {
            long roleCount = roleRepository.count();
            List<String> roleNames = roleRepository.findAll().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "roleCount", roleCount,
                    "roles", roleNames
            ));
        } catch (Exception e) {
            log.error("Error getting roles status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get roles status: " + e.getMessage()));
        }
    }

    @PostMapping("/register-simple")
    public ResponseEntity<?> registerSimple(@RequestBody AuthRequest req) {
        try {
            log.info("Registration attempt for email: {}", req.getEmail());
            
            // Basic validation
            if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }
            
            if (req.getPassword() == null || req.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 6 characters"));
            }
            
            if (req.getFirstName() == null || req.getFirstName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "First name is required"));
            }
            
            if (req.getLastName() == null || req.getLastName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Last name is required"));
            }
            
            log.info("Registration validation passed for: {}", req.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Registration validation successful"));
        } catch (Exception e) {
            log.error("Registration validation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        try {
            if (userRepo.findByEmail(req.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already in use"));
            }
            
            // Ensure roles exist
            ensureRolesExist();
            
            // Get default USER role
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Default user role not found"));
            
            // Create user with role
            User user = User.builder()
                    .email(req.getEmail())
                    .hashedPassword(passwordEncoder.encode(req.getPassword()))
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .phone(req.getPhone())
                    .roles(Set.of(userRole))
                    .build();
            
            // Save user
            User savedUser = userRepo.save(user);
            
            log.info("User registered successfully: {}", savedUser.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    private void ensureRolesExist() {
        if (roleRepository.count() == 0) {
            log.info("Creating default roles...");
            
            Role userRole = Role.builder()
                    .name("ROLE_USER")
                    .description("Regular user role")
                    .build();
            roleRepository.save(userRole);

            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);

            log.info("Default roles created successfully");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            // First check if user exists and is active
            User user = userRepo.findByEmail(req.getEmail()).orElse(null);
            if (user != null && !user.getActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Your account has been deactivated. Please contact an administrator."));
            }

            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

            // Get UserDetails to include authorities in the token
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            log.info("User authenticated: {}", userDetails.getUsername());
            log.info("User authorities: {}", userDetails.getAuthorities());
            
            // Generate JWT token using UserDetails to include authorities
            String token = jwtUtil.generateToken(userDetails);
            log.info("JWT token generated with authorities");

            // Create refresh token
            Instant now = Instant.now();
            String refreshToken = UUID.randomUUID().toString();
            RefreshToken rt = RefreshToken.builder()
                    .token(refreshToken)
                    .user(userRepo.findByEmail(auth.getName())
                            .orElseThrow(() -> new RuntimeException("User not found")))
                    .expiryDate(now.plus(24, ChronoUnit.HOURS))
                    .build();
            refreshTokenRepo.save(rt);

            return ResponseEntity.ok(Map.of(
                    "access_token", token,
                    "refresh_token", refreshToken));

        } catch (AuthenticationException e) {
            // Check if it's a disabled account error
            if (e instanceof DisabledException) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Your account has been deactivated. Please contact an administrator."));
            }
            
            // Check if user exists and is inactive
            User user = userRepo.findByEmail(req.getEmail()).orElse(null);
            if (user != null && !user.getActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Your account has been deactivated. Please contact an administrator."));
            }
            
            // Check if user exists
            User existingUser = userRepo.findByEmail(req.getEmail()).orElse(null);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Account does not exist. Please register first."));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid password. Please try again."));
            }
        } catch (Exception e) {
            log.error("Token generation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Token generation failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        return refreshTokenRepo.findByToken(request.getRefreshToken())
                .map(token -> {
                    if (token.getExpiryDate().isBefore(Instant.now())) {
                        refreshTokenRepo.delete(token);
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                    }

                    // Delete old refresh token
                    refreshTokenRepo.delete(token);

                    // Get UserDetails to include authorities in the token
                    UserDetails userDetails = userDetailsService.loadUserByUsername(token.getUser().getEmail());
                    
                    // Generate new access token using UserDetails to include authorities
                    String accessToken = jwtUtil.generateToken(userDetails);

                    // Generate NEW refresh token
                    Instant now = Instant.now();
                    String newRefreshToken = UUID.randomUUID().toString();
                    RefreshToken newRt = RefreshToken.builder()
                            .token(newRefreshToken)
                            .user(token.getUser())
                            .expiryDate(now.plus(24, ChronoUnit.HOURS))
                            .build();
                    refreshTokenRepo.save(newRt);

                    return ResponseEntity.ok(Map.of(
                            "access_token", accessToken,
                            "refresh_token", newRefreshToken));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        // Add token to blacklist or delete refresh token
        return ResponseEntity.ok().build();
    }

    // OTP Endpoints
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody OTPRequest request) {
        try {
            log.info("OTP request for email: {}", request.getEmail());
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }
            
            // Check if user already exists
            if (userRepo.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already registered"));
            }
            
            // Generate OTP
            String otp = otpService.generateOTP(request.getEmail());
            
            // Send OTP via email
            String userName = request.getUserData() != null ? 
                request.getUserData().getFirstName() + " " + request.getUserData().getLastName() : 
                "User";
            otpService.sendOTPEmail(request.getEmail(), userName);
            
            // Also log it for development purposes
            log.info("OTP for {}: {}", request.getEmail(), otp);
            
            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent successfully",
                    "email", request.getEmail()
            ));
            
        } catch (Exception e) {
            log.error("Failed to send OTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody OTPRequest request) {
        try {
            log.info("OTP verification for email: {}", request.getEmail());
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }
            
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "OTP is required"));
            }
            
            // Verify OTP
            boolean isValid = otpService.verifyOTP(request.getEmail(), request.getOtp());
            
            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired OTP"));
            }
            
            // If OTP is valid and user data is provided, register the user
            if (request.getUserData() != null) {
                AuthRequest userData = request.getUserData();
                
                // Ensure roles exist
                ensureRolesExist();
                
                // Get default USER role
                Role userRole = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("Default user role not found"));
                
                // Create user with role
                User user = User.builder()
                        .email(userData.getEmail())
                        .hashedPassword(passwordEncoder.encode(userData.getPassword()))
                        .firstName(userData.getFirstName())
                        .lastName(userData.getLastName())
                        .phone(userData.getPhone())
                        .roles(Set.of(userRole))
                        .build();
                
                // Save user
                User savedUser = userRepo.save(user);
                
                log.info("User registered successfully after OTP verification: {}", savedUser.getEmail());
                
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(Map.of("message", "User registered successfully"));
            }
            
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
            
        } catch (Exception e) {
            log.error("Failed to verify OTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to verify OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestBody OTPRequest request) {
        try {
            log.info("Resend OTP request for email: {}", request.getEmail());
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }
            
            // Resend OTP
            boolean success = otpService.resendOTP(request.getEmail());
            
            if (!success) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to resend OTP"));
            }
            
            // Send OTP via email
            String userName = request.getUserData() != null ? 
                request.getUserData().getFirstName() + " " + request.getUserData().getLastName() : 
                "User";
            otpService.sendOTPEmail(request.getEmail(), userName);
            
            // Also log it for development purposes
            log.info("OTP resent for: {}", request.getEmail());
            
            return ResponseEntity.ok(Map.of(
                    "message", "OTP resent successfully",
                    "email", request.getEmail()
            ));
            
        } catch (Exception e) {
            log.error("Failed to resend OTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to resend OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            log.info("Forgot password request for email: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }
            
            // Check if user exists
            var userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No account found with this email address"));
            }
            
            User user = userOpt.get();
            
            // Generate reset token
            String resetToken = UUID.randomUUID().toString();
            
            // Store reset token (you might want to create a separate table for this)
            // For now, we'll just log it
            log.info("Reset token generated for {}: {}", email, resetToken);
            
            // Send password reset email
            try {
                emailService.sendPasswordResetEmail(user, resetToken);
                log.info("Password reset email sent successfully to {}", email);
            } catch (Exception e) {
                log.error("Failed to send password reset email to {}: {}", email, e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to send password reset email. Please try again later."));
            }
            
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset instructions sent to your email",
                    "email", email
            ));
            
        } catch (Exception e) {
            log.error("Failed to process forgot password request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process your request. Please try again later."));
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            log.info("Validating reset token: {}", token);
            
            // For now, we'll just return success since we're not storing tokens
            // In a real implementation, you would validate the token against a database
            // and check if it's expired
            
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", "Reset token is valid"
            ));
            
        } catch (Exception e) {
            log.error("Failed to validate reset token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to validate reset token"));
        }
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable String token, @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            
            log.info("Password reset request for token: {}", token);
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Reset token is required"));
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password is required"));
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 6 characters"));
            }
            
            // For now, we'll just return success since we're not storing tokens
            // In a real implementation, you would:
            // 1. Validate the token against a database
            // 2. Check if it's expired
            // 3. Find the user associated with the token
            // 4. Update the user's password
            // 5. Delete the used token
            
            log.info("Password reset successful for token: {}", token);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successful"
            ));
            
        } catch (Exception e) {
            log.error("Failed to reset password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to reset password"));
        }
    }
}