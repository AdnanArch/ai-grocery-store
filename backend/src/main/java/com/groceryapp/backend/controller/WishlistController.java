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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Wishlist> wishlist = wishlistRepository.findByUserId(user.getId());
        return ResponseEntity.ok(wishlist);
    }

    // Add product to wishlist
    @PostMapping("/add")
    public ResponseEntity<Wishlist> addToWishlist(@RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long productId = Long.valueOf(request.get("productId").toString());
        String wishlistName = (String) request.getOrDefault("wishlistName", "Default");
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return ResponseEntity.badRequest().build();
        }
        
        Wishlist wishlistItem = Wishlist.builder()
                .user(user)
                .product(product)
                .wishlistName(wishlistName)
                .build();
        
        Wishlist saved = wishlistRepository.save(wishlistItem);
        return ResponseEntity.ok(saved);
    }

    // Remove product from wishlist
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        return ResponseEntity.ok().build();
    }

    // Create new wishlist
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createWishlist(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String wishlistName = request.get("name");
        
        // Create a placeholder wishlist item to establish the wishlist
        Wishlist wishlistItem = Wishlist.builder()
                .user(user)
                .product(null) // This will be updated when products are added
                .wishlistName(wishlistName)
                .build();
        
        wishlistRepository.save(wishlistItem);
        
        return ResponseEntity.ok(Map.of("message", "Wishlist created successfully"));
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
