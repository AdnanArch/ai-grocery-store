package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.ProductRepository;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class AIRecommendationsController {

    private final ProductRepository productRepository;

    private final UserRepository userRepository;

    private final OrderRepository orderRepository;

    // Get AI recommendations for user
    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, List<Product>>> getRecommendations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Product> allProducts = productRepository.findAll();
        
        // Mock AI recommendations - in a real implementation, this would use ML models
        Map<String, List<Product>> recommendations = new HashMap<>();
        
        // Personalized recommendations based on user behavior
        recommendations.put("personalized", getPersonalizedRecommendations(user, allProducts));
        
        // Trending products
        recommendations.put("trending", getTrendingProducts(allProducts));
        
        // Similar products
        recommendations.put("similar", getSimilarProducts(user, allProducts));
        
        // Seasonal recommendations
        recommendations.put("seasonal", getSeasonalProducts(allProducts));
        
        return ResponseEntity.ok(recommendations);
    }

    // Get user preferences
    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getUserPreferences() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Mock user preferences - in a real implementation, this would be stored in database
        Map<String, Object> preferences = new HashMap<>();
        preferences.put("categories", Arrays.asList("Fruits & Vegetables", "Dairy & Eggs"));
        preferences.put("priceRange", "medium");
        preferences.put("dietaryRestrictions", Arrays.asList("Vegetarian"));
        
        return ResponseEntity.ok(preferences);
    }

    // Update user preferences
    @PutMapping("/preferences")
    public ResponseEntity<Map<String, String>> updatePreferences(@RequestBody Map<String, Object> preferences) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // TODO: Save preferences to database
        // In a real implementation, you would save these to a UserPreferences entity
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Preferences updated successfully");
        
        return ResponseEntity.ok(response);
    }

    // Get product recommendations for a specific product
    @GetMapping("/products/{productId}/recommendations")
    public ResponseEntity<List<Product>> getProductRecommendations(@PathVariable Long productId) {
        List<Product> allProducts = productRepository.findAll();
        Product targetProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Mock similar products based on category
        List<Product> similarProducts = allProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .filter(p -> p.getCategory() != null && targetProduct.getCategory() != null &&
                           p.getCategory().getId().equals(targetProduct.getCategory().getId()))
                .limit(6)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(similarProducts);
    }

    // Get trending products
    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrendingProducts() {
        List<Product> allProducts = productRepository.findAll();
        List<Product> trending = getTrendingProducts(allProducts);
        return ResponseEntity.ok(trending);
    }

    // Private helper methods for mock recommendations
    private List<Product> getPersonalizedRecommendations(User user, List<Product> allProducts) {
        // Mock personalized recommendations based on user's order history
        return allProducts.stream()
                .filter(p -> p.getCategory() != null)
                .filter(p -> p.getCategory().getName().contains("Fruits") || 
                           p.getCategory().getName().contains("Dairy"))
                .limit(8)
                .collect(Collectors.toList());
    }

    private List<Product> getTrendingProducts(List<Product> allProducts) {
        // Mock trending products - in real implementation, this would be based on sales data
        return allProducts.stream()
                .filter(p -> p.getPrice().doubleValue() > 5.0)
                .limit(6)
                .collect(Collectors.toList());
    }

    private List<Product> getSimilarProducts(User user, List<Product> allProducts) {
        // Mock similar products based on user's recent views/purchases
        return allProducts.stream()
                .filter(p -> p.getCategory() != null)
                .filter(p -> p.getCategory().getName().contains("Bakery") || 
                           p.getCategory().getName().contains("Beverages"))
                .limit(6)
                .collect(Collectors.toList());
    }

    private List<Product> getSeasonalProducts(List<Product> allProducts) {
        // Mock seasonal products - in real implementation, this would be based on current season
        Calendar cal = Calendar.getInstance();
        int month = cal.get(Calendar.MONTH);
        
        List<Product> seasonal = new ArrayList<>();
        
        if (month >= 5 && month <= 8) { // Summer
            seasonal = allProducts.stream()
                    .filter(p -> p.getName().toLowerCase().contains("fruit") || 
                               p.getName().toLowerCase().contains("juice"))
                    .limit(6)
                    .collect(Collectors.toList());
        } else if (month >= 9 && month <= 11) { // Fall
            seasonal = allProducts.stream()
                    .filter(p -> p.getName().toLowerCase().contains("pumpkin") || 
                               p.getName().toLowerCase().contains("apple"))
                    .limit(6)
                    .collect(Collectors.toList());
        } else { // Winter/Spring
            seasonal = allProducts.stream()
                    .filter(p -> p.getName().toLowerCase().contains("soup") || 
                               p.getName().toLowerCase().contains("bread"))
                    .limit(6)
                    .collect(Collectors.toList());
        }
        
        return seasonal;
    }

    // Get AI insights for user
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getUserInsights() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> insights = new HashMap<>();
        insights.put("favoriteCategory", "Fruits & Vegetables");
        insights.put("averageOrderValue", 45.67);
        insights.put("preferredShoppingTime", "Evening");
        insights.put("loyaltyScore", 85);
        insights.put("recommendedProducts", 12);
        
        return ResponseEntity.ok(insights);
    }

    // Get search suggestions
    @GetMapping("/search-suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestParam String query) {
        List<Product> allProducts = productRepository.findAll();
        
        List<String> suggestions = allProducts.stream()
                .map(Product::getName)
                .filter(name -> name.toLowerCase().contains(query.toLowerCase()))
                .limit(5)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(suggestions);
    }
}
