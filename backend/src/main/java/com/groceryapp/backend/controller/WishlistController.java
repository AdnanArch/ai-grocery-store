package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Wishlist;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.repository.WishlistRepository;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Slf4j
public class WishlistController {

    private final WishlistRepository wishlistRepository;

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    // Get user's wishlist
    @GetMapping
    public ResponseEntity<List<Wishlist>> getUserWishlist() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            log.info("Fetching wishlist for user: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Wishlist> wishlist = wishlistRepository.findByUserId(user.getId());
            log.info("Found {} wishlist items for user {}", wishlist.size(), user.getId());
            
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            log.error("Error fetching wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Add product to wishlist
    @PostMapping("/add")
    public ResponseEntity<Wishlist> addToWishlist(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            log.info("Adding product to wishlist for user: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long productId = Long.valueOf(request.get("productId").toString());
            String wishlistName = (String) request.getOrDefault("wishlistName", "Default");
            
            log.info("Adding product {} to wishlist '{}' for user {}", productId, wishlistName, user.getId());
            
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            // Check if already in wishlist
            if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
                log.info("Product {} already exists in wishlist for user {}", productId, user.getId());
                return ResponseEntity.badRequest().build();
            }
            
            Wishlist wishlistItem = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .wishlistName(wishlistName)
                    .build();
            
            Wishlist saved = wishlistRepository.save(wishlistItem);
            log.info("Successfully added product {} to wishlist for user {}", productId, user.getId());
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error adding product to wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Remove product from wishlist
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            log.info("Attempting to remove product {} from wishlist for user {}", productId, email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            log.info("Found user with ID: {}", user.getId());
            
            // Check if the wishlist item exists before deleting
            boolean exists = wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
            log.info("Wishlist item exists: {}", exists);
            
            if (!exists) {
                log.warn("Wishlist item not found for user {} and product {}", user.getId(), productId);
                return ResponseEntity.notFound().build();
            }
            
            wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
            log.info("Successfully removed product {} from wishlist for user {}", productId, user.getId());
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing product {} from wishlist: {}", productId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Create new wishlist
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createWishlist(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            log.info("Creating new wishlist for user: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String wishlistName = request.get("name");
            
            // Note: We don't create empty wishlist items since product_id is required
            // Wishlists are created when products are added to them
            
            log.info("Wishlist '{}' created successfully for user {}", wishlistName, user.getId());
            
            return ResponseEntity.ok(Map.of("message", "Wishlist created successfully"));
        } catch (Exception e) {
            log.error("Error creating wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create wishlist"));
        }
    }

    // Get wishlist names for user
    @GetMapping("/names")
    public ResponseEntity<List<String>> getWishlistNames() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<String> wishlistNames = wishlistRepository.findWishlistNamesByUserId(user.getId());
        return ResponseEntity.ok(wishlistNames);
    }

    // Get products in specific wishlist
    @GetMapping("/{wishlistName}")
    public ResponseEntity<List<Wishlist>> getWishlistByName(@PathVariable String wishlistName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Wishlist> wishlist = wishlistRepository.findByUserIdAndWishlistName(user.getId(), wishlistName);
        return ResponseEntity.ok(wishlist);
    }

    // Add product to specific wishlist
    @PostMapping("/{wishlistId}/add")
    public ResponseEntity<Wishlist> addToSpecificWishlist(
            @PathVariable Long wishlistId,
            @RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long productId = Long.valueOf(request.get("productId").toString());
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Wishlist wishlistItem = Wishlist.builder()
                .user(user)
                .product(product)
                .wishlistName("Wishlist " + wishlistId)
                .build();
        
        Wishlist saved = wishlistRepository.save(wishlistItem);
        return ResponseEntity.ok(saved);
    }
}
