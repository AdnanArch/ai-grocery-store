package com.groceryapp.backend.config;

import com.groceryapp.backend.model.Category;
import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.model.ProductImage;
import com.groceryapp.backend.model.Role;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.CategoryRepository;
import com.groceryapp.backend.repository.ProductImageRepository;
import com.groceryapp.backend.repository.ProductRepository;
import com.groceryapp.backend.repository.RoleRepository;
import com.groceryapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            log.info("Initializing basic data...");

            // Create roles first
            createRoles();

            // Create hardcoded admin account
            createHardcodedAdmin();

            // Clean up any duplicate categories
            cleanupDuplicateCategories();

            // Create categories (needed for products)
            List<Category> categories = createCategories();

            // Note: Products are not created on startup as requested by user
            // createProducts(categories);

            log.info("Basic data initialization complete! Categories created successfully.");
        };
    }

    private void createRoles() {
        if (roleRepository.count() == 0) {
            log.info("Creating roles...");
            
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

            log.info("Roles created successfully");
        }
    }

    private void createHardcodedAdmin() {
        // Check if admin already exists
        if (userRepository.findByEmail("admin@grocerystore.com").isPresent()) {
            log.info("Hardcoded admin already exists, skipping...");
            return;
        }

        log.info("Creating hardcoded admin account...");
        
        // Get admin role
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
        
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);

        // Create hardcoded admin user
        User admin = User.builder()
                .email("admin@grocerystore.com")
                .hashedPassword(passwordEncoder.encode("admin123"))
                .firstName("Super")
                .lastName("Admin")
                .phone("1234567890")
                .roles(adminRoles)
                .active(true)
                .build();

        userRepository.save(admin);
        log.info("Hardcoded admin account created successfully!");
        log.info("Admin Email: admin@grocerystore.com");
        log.info("Admin Password: admin123");
    }

    private List<Category> createCategories() {
        // Check if categories already exist
        if (categoryRepository.count() > 0) {
            log.info("Categories already exist, skipping category creation...");
            return categoryRepository.findAll();
        }

        log.info("Creating categories...");
        List<Category> categories = new ArrayList<>();

        // Main categories
        Category fruits = categoryRepository
                .save(Category.builder().name("Fruits").description("Fresh fruits").build());
        Category vegetables = categoryRepository
                .save(Category.builder().name("Vegetables").description("Fresh vegetables").build());
        Category dairy = categoryRepository
                .save(Category.builder().name("Dairy").description("Milk and dairy products").build());
        Category bakery = categoryRepository
                .save(Category.builder().name("Bakery").description("Bread and baked goods").build());
        Category meat = categoryRepository
                .save(Category.builder().name("Meat").description("Fresh meat and poultry").build());
        Category seafood = categoryRepository
                .save(Category.builder().name("Seafood").description("Fresh fish and seafood").build());
        Category beverages = categoryRepository
                .save(Category.builder().name("Beverages").description("Drinks and juices").build());
        Category snacks = categoryRepository
                .save(Category.builder().name("Snacks").description("Chips, nuts, and other snacks").build());
        Category frozen = categoryRepository
                .save(Category.builder().name("Frozen Foods").description("Frozen meals and ingredients").build());
        Category pantry = categoryRepository
                .save(Category.builder().name("Pantry").description("Dry goods and staples").build());

        categories.add(fruits);
        categories.add(vegetables);
        categories.add(dairy);
        categories.add(bakery);
        categories.add(meat);
        categories.add(seafood);
        categories.add(beverages);
        categories.add(snacks);
        categories.add(frozen);
        categories.add(pantry);

        log.info("Categories created successfully");
        return categories;
    }

    private void cleanupDuplicateCategories() {
        log.info("Checking for duplicate categories...");
        List<Category> allCategories = categoryRepository.findAll();
        
        // Group categories by name
        Map<String, List<Category>> categoriesByName = allCategories.stream()
            .collect(java.util.stream.Collectors.groupingBy(Category::getName));
        
        // Remove duplicates, keeping the first one
        categoriesByName.forEach((name, duplicates) -> {
            if (duplicates.size() > 1) {
                log.info("Found {} duplicate categories for name: {}", duplicates.size(), name);
                // Keep the first one, delete the rest
                for (int i = 1; i < duplicates.size(); i++) {
                    categoryRepository.delete(duplicates.get(i));
                    log.info("Deleted duplicate category: {}", duplicates.get(i).getId());
                }
            }
        });
        
        log.info("Duplicate category cleanup completed");
    }

    private void createProducts(List<Category> categories) {
        // Fruits
        createProduct("Apples", "Fresh red apples", new BigDecimal("837.20"), 100, categories.get(0));
        createProduct("Bananas", "Ripe yellow bananas", new BigDecimal("417.20"), 150, categories.get(0));
        createProduct("Oranges", "Sweet juicy oranges", new BigDecimal("977.20"), 80, categories.get(0));
        createProduct("Strawberries", "Sweet red strawberries", new BigDecimal("1397.20"), 50, categories.get(0));
        createProduct("Blueberries", "Fresh blueberries", new BigDecimal("1677.20"), 40, categories.get(0));
        createProduct("Grapes", "Green seedless grapes", new BigDecimal("1117.20"), 60, categories.get(0));

        // Vegetables
        createProduct("Carrots", "Fresh orange carrots", new BigDecimal("557.20"), 120, categories.get(1));
        createProduct("Broccoli", "Green broccoli crowns", new BigDecimal("697.20"), 80, categories.get(1));
        createProduct("Spinach", "Fresh baby spinach", new BigDecimal("1117.20"), 60, categories.get(1));
        createProduct("Tomatoes", "Vine-ripened tomatoes", new BigDecimal("837.20"), 100, categories.get(1));
        createProduct("Potatoes", "Russet potatoes", new BigDecimal("1397.20"), 150, categories.get(1));
        createProduct("Onions", "Yellow onions", new BigDecimal("417.20"), 200, categories.get(1));

        // Dairy
        createProduct("Milk", "Whole milk, 1 gallon", new BigDecimal("1117.20"), 80, categories.get(2));
        createProduct("Cheese", "Cheddar cheese block", new BigDecimal("1677.20"), 60, categories.get(2));
        createProduct("Yogurt", "Greek yogurt, plain", new BigDecimal("1257.20"), 70, categories.get(2));
        createProduct("Butter", "Unsalted butter", new BigDecimal("1117.20"), 50, categories.get(2));
        createProduct("Eggs", "Large brown eggs, dozen", new BigDecimal("1397.20"), 100, categories.get(2));
        createProduct("Cream", "Heavy whipping cream", new BigDecimal("977.20"), 40, categories.get(2));

        // Bakery
        createProduct("Bread", "Whole wheat bread", new BigDecimal("977.20"), 60, categories.get(3));
        createProduct("Bagels", "Plain bagels, 6-pack", new BigDecimal("1397.20"), 40, categories.get(3));
        createProduct("Muffins", "Blueberry muffins, 4-pack", new BigDecimal("1677.20"), 30, categories.get(3));
        createProduct("Croissants", "Butter croissants, 4-pack", new BigDecimal("1957.20"), 25, categories.get(3));
        createProduct("Cake", "Chocolate cake", new BigDecimal("3637.20"), 15, categories.get(3));
        createProduct("Cookies", "Chocolate chip cookies, dozen", new BigDecimal("1397.20"), 50, categories.get(3));

        // Meat
        createProduct("Chicken Breast", "Boneless skinless chicken breast", new BigDecimal("2237.20"), 50, categories.get(4));
        createProduct("Ground Beef", "80/20 ground beef", new BigDecimal("1957.20"), 60, categories.get(4));
        createProduct("Steak", "Ribeye steak", new BigDecimal("4477.20"), 30, categories.get(4));
        createProduct("Pork Chops", "Bone-in pork chops", new BigDecimal("2517.20"), 40, categories.get(4));
        createProduct("Bacon", "Hickory smoked bacon", new BigDecimal("1677.20"), 70, categories.get(4));
        createProduct("Sausage", "Italian sausage links", new BigDecimal("1817.20"), 45, categories.get(4));

        // Seafood
        createProduct("Salmon", "Fresh Atlantic salmon fillet", new BigDecimal("3637.20"), 30, categories.get(5));
        createProduct("Shrimp", "Large raw shrimp", new BigDecimal("4197.20"), 25, categories.get(5));
        createProduct("Tuna", "Ahi tuna steak", new BigDecimal("4757.20"), 20, categories.get(5));
        createProduct("Cod", "Fresh cod fillet", new BigDecimal("3077.20"), 35, categories.get(5));
        createProduct("Crab", "Snow crab legs", new BigDecimal("5317.20"), 15, categories.get(5));
        createProduct("Lobster", "Live Maine lobster", new BigDecimal("6997.20"), 10, categories.get(5));

        // Beverages
        createProduct("Water", "Bottled spring water, 24-pack", new BigDecimal("1677.20"), 100, categories.get(6));
        createProduct("Soda", "Cola, 12-pack", new BigDecimal("1957.20"), 80, categories.get(6));
        createProduct("Orange Juice", "Fresh squeezed orange juice", new BigDecimal("1397.20"), 50, categories.get(6));
        createProduct("Coffee", "Ground coffee, medium roast", new BigDecimal("2517.20"), 60, categories.get(6));
        createProduct("Tea", "Black tea, 50 bags", new BigDecimal("1257.20"), 70, categories.get(6));
        createProduct("Energy Drink", "Energy drink, 6-pack", new BigDecimal("2797.20"), 40, categories.get(6));

        // Snacks
        createProduct("Potato Chips", "Classic potato chips", new BigDecimal("1117.20"), 80, categories.get(7));
        createProduct("Pretzels", "Salted pretzels", new BigDecimal("837.20"), 70, categories.get(7));
        createProduct("Popcorn", "Microwave popcorn, 6-pack", new BigDecimal("1257.20"), 60, categories.get(7));
        createProduct("Nuts", "Mixed nuts, salted", new BigDecimal("1957.20"), 50, categories.get(7));
        createProduct("Chocolate", "Milk chocolate bar", new BigDecimal("697.20"), 100, categories.get(7));
        createProduct("Crackers", "Cheese crackers", new BigDecimal("977.20"), 75, categories.get(7));

        // Frozen Foods
        createProduct("Pizza", "Frozen pepperoni pizza", new BigDecimal("2237.20"), 40, categories.get(8));
        createProduct("Ice Cream", "Vanilla ice cream", new BigDecimal("1677.20"), 50, categories.get(8));
        createProduct("Frozen Vegetables", "Mixed vegetables", new BigDecimal("1117.20"), 60, categories.get(8));
        createProduct("TV Dinner", "Chicken dinner", new BigDecimal("1397.20"), 45, categories.get(8));
        createProduct("Frozen Berries", "Mixed berries", new BigDecimal("1957.20"), 35, categories.get(8));
        createProduct("Frozen Waffles", "Homestyle waffles", new BigDecimal("977.20"), 55, categories.get(8));

        // Pantry
        createProduct("Rice", "White rice, 5 lb bag", new BigDecimal("1397.20"), 80, categories.get(9));
        createProduct("Pasta", "Spaghetti, 1 lb", new BigDecimal("557.20"), 100, categories.get(9));
        createProduct("Cereal", "Corn flakes", new BigDecimal("1117.20"), 70, categories.get(9));
        createProduct("Soup", "Chicken noodle soup", new BigDecimal("697.20"), 90, categories.get(9));
        createProduct("Peanut Butter", "Creamy peanut butter", new BigDecimal("1117.20"), 60, categories.get(9));
        createProduct("Olive Oil", "Extra virgin olive oil", new BigDecimal("2517.20"), 50, categories.get(9));
    }

    private void createProduct(String name, String description, BigDecimal price, Integer stock, Category category) {
        Instant now = Instant.now();
        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .category(category)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Product savedProduct = productRepository.save(product);
        
        // Add a sample image URL for the product
        String imageUrl = generateImageUrl(name);
        ProductImage productImage = ProductImage.builder()
                .product(savedProduct)
                .url(imageUrl)
                .altText(name)
                .isPrimary(true)
                .build();
        
        productImageRepository.save(productImage);
    }
    
    private String generateImageUrl(String productName) {
        // Generate a placeholder image URL based on the product name
        String searchTerm = productName.toLowerCase().replace(" ", "+");
        return "https://source.unsplash.com/400x400/?" + searchTerm + ",grocery";
    }
}
