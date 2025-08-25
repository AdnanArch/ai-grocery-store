package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.*;
import com.groceryapp.backend.model.Role;
import com.groceryapp.backend.repository.*;
import com.groceryapp.backend.repository.RoleRepository;
import com.groceryapp.backend.service.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // File upload directory
    private static final String UPLOAD_DIR = "uploads/products/";

    // File upload endpoint
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select a file to upload"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size must be less than 5MB"));
            }

            // Validate file extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid filename"));
            }

            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp").contains(fileExtension)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported file format. Please use JPG, PNG, GIF, or WebP"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String filename = "product_" + System.currentTimeMillis() + fileExtension;
            Path filePath = uploadPath.resolve(filename);

            // Check if file already exists (very unlikely but good practice)
            int counter = 1;
            while (Files.exists(filePath)) {
                filename = "product_" + System.currentTimeMillis() + "_" + counter + fileExtension;
                filePath = uploadPath.resolve(filename);
                counter++;
            }

                        // Save file
            Files.copy(file.getInputStream(), filePath);
            
            // Verify file was saved
            if (Files.exists(filePath)) {
                log.info("File saved successfully to disk: {} (size: {} bytes)", filePath.toAbsolutePath(), Files.size(filePath));
            } else {
                log.error("File was not saved to disk: {}", filePath.toAbsolutePath());
            }
            
            // Return file URL (public endpoint)
            String fileUrl = "/api/images/products/" + filename;
            
            log.info("File uploaded successfully: {} -> URL: {}", filename, fileUrl);
            
            return ResponseEntity.ok(Map.of(
                "message", "File uploaded successfully",
                "filename", filename,
                "url", fileUrl,
                "size", file.getSize()
            ));

        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during file upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred during file upload"));
        }
    }



    // Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        // Calculate total revenue from all orders
        List<Order> allOrders = orderRepository.findAll();
        log.info("Found {} orders for revenue calculation", allOrders.size());
        
        BigDecimal totalRevenue = allOrders.stream()
                .filter(order -> order.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        log.info("Total revenue calculated: {}", totalRevenue);
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        
        log.info("Final stats object: {}", stats);
        return ResponseEntity.ok(stats);
    }

    // Product Management
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        // Use a more efficient approach to load products with their related entities
        // This avoids the ConcurrentModificationException by using fetch joins
        List<Product> products = productRepository.findAllWithCategoryAndImages();
        log.info("Loaded {} products", products.size());
        for (Product product : products) {
            log.info("Product: {} (ID: {}) has {} images", 
                product.getName(), 
                product.getId(), 
                product.getImages() != null ? product.getImages().size() : 0);
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                for (ProductImage image : product.getImages()) {
                    log.info("  - Image: {} (URL: {})", image.getId(), image.getUrl());
                }
            }
        }
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> request) {
        try {
            // Extract product data
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            Number priceNumber = (Number) request.get("price");
            Number stockNumber = (Number) request.get("stock");
            Map<String, Object> categoryMap = (Map<String, Object>) request.get("category");
            String imageUrl = (String) request.get("imageUrl");
            String imageAltText = (String) request.get("imageAltText");
            
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product name is required"));
            }
            if (priceNumber == null || priceNumber.doubleValue() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product price must be greater than 0"));
            }
            if (stockNumber == null || stockNumber.intValue() < 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product stock must be non-negative"));
            }
            
            // Check for duplicate product name
            if (productRepository.existsByNameIgnoreCase(name.trim())) {
                return ResponseEntity.badRequest().body(Map.of("message", "A product with this name already exists"));
            }

            // Create product object
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(BigDecimal.valueOf(priceNumber.doubleValue()));
            product.setStock(stockNumber.intValue());
            product.setCreatedAt(Instant.now());
            product.setUpdatedAt(Instant.now());
            
            // Handle category
            if (categoryMap != null && categoryMap.get("id") != null) {
                Long categoryId = Long.valueOf(categoryMap.get("id").toString());
                Category category = categoryRepository.findById(categoryId).orElse(null);
                if (category == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid category ID"));
                }
                product.setCategory(category);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Category is required"));
            }
            
            // Save the product first
            Product savedProduct = productRepository.save(product);
            
            // Handle image if provided
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                log.info("Creating product image with URL: {}", imageUrl);
                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setUrl(imageUrl);
                image.setAltText(imageAltText != null ? imageAltText : name);
                image.setPrimary(true);
                ProductImage savedImage = productImageRepository.save(image);
                log.info("Product image saved with ID: {}", savedImage.getId());
                
                // Reload the product with images
                savedProduct = productRepository.findByIdWithCategoryAndImages(savedProduct.getId()).orElse(savedProduct);
                log.info("Product reloaded with {} images", savedProduct.getImages() != null ? savedProduct.getImages().size() : 0);
            }
            
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create product: " + e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Product existingProduct = productRepository.findById(id).orElse(null);
            if (existingProduct == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Extract product data
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            Number priceNumber = (Number) request.get("price");
            Number stockNumber = (Number) request.get("stock");
            Map<String, Object> categoryMap = (Map<String, Object>) request.get("category");
            String imageUrl = (String) request.get("imageUrl");
            String imageAltText = (String) request.get("imageAltText");
            
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product name is required"));
            }
            if (priceNumber == null || priceNumber.doubleValue() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product price must be greater than 0"));
            }
            if (stockNumber == null || stockNumber.intValue() < 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product stock must be non-negative"));
            }
            
            // Update product fields
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(BigDecimal.valueOf(priceNumber.doubleValue()));
            existingProduct.setStock(stockNumber.intValue());
            existingProduct.setUpdatedAt(Instant.now());
            
            // Handle category
            if (categoryMap != null && categoryMap.get("id") != null) {
                Long categoryId = Long.valueOf(categoryMap.get("id").toString());
                Category category = categoryRepository.findById(categoryId).orElse(null);
                if (category == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid category ID"));
                }
                existingProduct.setCategory(category);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Category is required"));
            }
            
            // Save the updated product
            Product updatedProduct = productRepository.save(existingProduct);
            
            // Handle image if provided
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                // Clear existing images
                List<ProductImage> existingImages = productImageRepository.findByProductId(id);
                for (ProductImage existingImage : existingImages) {
                    productImageRepository.delete(existingImage);
                }
                
                // Add new image
                ProductImage image = new ProductImage();
                image.setProduct(updatedProduct);
                image.setUrl(imageUrl);
                image.setAltText(imageAltText != null ? imageAltText : name);
                image.setPrimary(true);
                productImageRepository.save(image);
                
                // Reload the product with images
                updatedProduct = productRepository.findByIdWithCategoryAndImages(updatedProduct.getId()).orElse(updatedProduct);
            }
            
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update product: " + e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productRepository.findByIdWithCategoryAndImages(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    // Product Image Management
    @PostMapping("/products/{productId}/images")
    public ResponseEntity<ProductImage> addProductImage(@PathVariable Long productId, @RequestBody ProductImage image) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        
        image.setProduct(product);
        ProductImage savedImage = productImageRepository.save(image);
        return ResponseEntity.ok(savedImage);
    }

    @DeleteMapping("/products/{productId}/images/{imageId}")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long productId, @PathVariable Long imageId) {
        ProductImage image = productImageRepository.findById(imageId).orElse(null);
        if (image == null || !image.getProduct().getId().equals(productId)) {
            return ResponseEntity.notFound().build();
        }
        
        productImageRepository.delete(image);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/products/{productId}/images")
    public ResponseEntity<List<ProductImage>> getProductImages(@PathVariable Long productId) {
        List<ProductImage> images = productImageRepository.findByProductId(productId);
        return ResponseEntity.ok(images);
    }

    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        
        String status = request.get("status");
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        Boolean active = request.get("active");
        user.setActive(active);
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/admins/{id}/status")
    public ResponseEntity<Map<String, Object>> updateAdminStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        try {
            User admin = userRepository.findById(id).orElse(null);
            if (admin == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user is actually an admin
            boolean isAdmin = admin.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User is not an admin");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Prevent deactivating the super admin
            if (admin.getEmail().equals("admin@grocerystore.com")) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Cannot deactivate the super admin account");
                return ResponseEntity.badRequest().body(error);
            }
            
            Boolean active = request.get("active");
            admin.setActive(active);
            User updatedAdmin = userRepository.save(admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin status updated successfully");
            response.put("admin", updatedAdmin);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update admin status: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // Create new admin user (only existing admins can create new admins)
    @PostMapping("/users/create-admin")
    public ResponseEntity<Map<String, Object>> createAdminUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String phone = request.get("phone");

            // Validate required fields
            if (email == null || password == null || firstName == null || lastName == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email, password, firstName, and lastName are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User with this email already exists");
                return ResponseEntity.badRequest().body(error);
            }

            // Get admin role
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);

            // Create admin user
            User admin = User.builder()
                    .email(email)
                    .hashedPassword(passwordEncoder.encode(password))
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone(phone != null ? phone : "")
                    .roles(adminRoles)
                    .active(true)
                    .build();

            User savedAdmin = userRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin user created successfully");
            response.put("user", Map.of(
                "id", savedAdmin.getId(),
                "email", savedAdmin.getEmail(),
                "firstName", savedAdmin.getFirstName(),
                "lastName", savedAdmin.getLastName(),
                "role", "ADMIN"
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create admin user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Category Management
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    // Initialize sample categories
    @PostMapping("/categories/init")
    public ResponseEntity<Map<String, Object>> initializeCategories() {
        try {
            // Check if categories already exist
            if (categoryRepository.count() > 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Categories already exist"));
            }

            // Create sample categories
            Category fruits = Category.builder()
                    .name("Fruits")
                    .description("Fresh fruits and berries")
                    .build();
            categoryRepository.save(fruits);

            Category vegetables = Category.builder()
                    .name("Vegetables")
                    .description("Fresh vegetables and greens")
                    .build();
            categoryRepository.save(vegetables);

            Category dairy = Category.builder()
                    .name("Dairy")
                    .description("Milk, cheese, and dairy products")
                    .build();
            categoryRepository.save(dairy);

            Category meat = Category.builder()
                    .name("Meat & Poultry")
                    .description("Fresh meat and poultry products")
                    .build();
            categoryRepository.save(meat);

            Category grains = Category.builder()
                    .name("Grains & Cereals")
                    .description("Rice, pasta, bread, and cereals")
                    .build();
            categoryRepository.save(grains);

            Category beverages = Category.builder()
                    .name("Beverages")
                    .description("Drinks and beverages")
                    .build();
            categoryRepository.save(beverages);

            return ResponseEntity.ok(Map.of("message", "Sample categories initialized successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to initialize categories: " + e.getMessage()));
        }
    }

    // Analytics
    @GetMapping("/analytics/sales")
    public ResponseEntity<Map<String, Object>> getSalesAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get orders by status
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long processingOrders = orderRepository.countByStatus("PROCESSING");
        long completedOrders = orderRepository.countByStatus("COMPLETED");
        
        analytics.put("pendingOrders", pendingOrders);
        analytics.put("processingOrders", processingOrders);
        analytics.put("completedOrders", completedOrders);
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/products")
    public ResponseEntity<Map<String, Object>> getProductAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get low stock products
        List<Product> lowStockProducts = productRepository.findByStockLessThan(10);
        analytics.put("lowStockProducts", lowStockProducts);
        
        // Get total categories
        long totalCategories = categoryRepository.count();
        analytics.put("totalCategories", totalCategories);
        
        return ResponseEntity.ok(analytics);
    }
}
