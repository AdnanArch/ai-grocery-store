package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Review;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.repository.ReviewRepository;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    // Get reviews for a product with pagination and filtering
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Map<String, Object>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) Integer rating) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews;
        
        if (rating != null && rating > 0) {
            reviews = reviewRepository.findByProductIdAndRatingGreaterThanEqual(productId, rating, pageable);
        } else {
            reviews = reviewRepository.findByProductIdWithSorting(productId, sort, pageable);
        }
        
        // Get average rating and review count
        Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        Long reviewCount = reviewRepository.getReviewCountByProductId(productId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviews.getContent());
        response.put("totalPages", reviews.getTotalPages());
        response.put("totalElements", reviews.getTotalElements());
        response.put("currentPage", reviews.getNumber());
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        response.put("reviewCount", reviewCount != null ? reviewCount : 0L);
        
        return ResponseEntity.ok(response);
    }

    // Create a new review
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<Review> createReview(
            @PathVariable Long productId,
            @RequestBody Review reviewRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user already reviewed this product
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate rating
        if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            return ResponseEntity.badRequest().build();
        }
        
        Review review = Review.builder()
                .user(user)
                .product(product)
                .title(reviewRequest.getTitle())
                .comment(reviewRequest.getComment())
                .rating(reviewRequest.getRating())
                .verified(false) // Could be set to true if user has purchased the product
                .build();
        
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    // Update a review
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Review reviewRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if user owns the review or is admin
        if (!existingReview.getUser().getId().equals(user.getId()) && 
            !user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        // Validate rating
        if (reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            return ResponseEntity.badRequest().build();
        }
        
        existingReview.setTitle(reviewRequest.getTitle());
        existingReview.setComment(reviewRequest.getComment());
        existingReview.setRating(reviewRequest.getRating());
        
        Review updated = reviewRepository.save(existingReview);
        return ResponseEntity.ok(updated);
    }

    // Delete a review
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if user owns the review or is admin
        if (!review.getUser().getId().equals(user.getId()) && 
            !user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        reviewRepository.delete(review);
        return ResponseEntity.ok().build();
    }

    // Get user's reviews
    @GetMapping("/users/reviews")
    public ResponseEntity<Map<String, Object>> getUserReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByUserId(user.getId(), pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviews.getContent());
        response.put("totalPages", reviews.getTotalPages());
        response.put("totalElements", reviews.getTotalElements());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    // Get review statistics for a product
    @GetMapping("/products/{productId}/reviews/stats")
    public ResponseEntity<Map<String, Object>> getReviewStats(@PathVariable Long productId) {
        Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        Long reviewCount = reviewRepository.getReviewCountByProductId(productId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", averageRating != null ? averageRating : 0.0);
        stats.put("reviewCount", reviewCount != null ? reviewCount : 0L);
        
        return ResponseEntity.ok(stats);
    }
}
