package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepo;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        return userRepo.findByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepo.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userRepo.findById(id).map(existing -> {
            user.setId(id);
            return ResponseEntity.ok(userRepo.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> profileData) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        return userRepo.findByEmail(authentication.getName())
                .map(user -> {
                    user.setFirstName(profileData.get("firstName"));
                    user.setLastName(profileData.get("lastName"));
                    user.setPhone(profileData.get("phone"));
                    
                    User updatedUser = userRepo.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody Map<String, String> passwordData) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        return userRepo.findByEmail(authentication.getName())
                .map(user -> {
                    String currentPassword = passwordData.get("currentPassword");
                    String newPassword = passwordData.get("newPassword");

                    // Verify current password
                    if (!passwordEncoder.matches(currentPassword, user.getHashedPassword())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Current password is incorrect"));
                    }

                    // Update password
                    user.setHashedPassword(passwordEncoder.encode(newPassword));
                    userRepo.save(user);
                    
                    return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            userRepo.deleteById(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
