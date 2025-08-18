package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    // Find products by category with pagination
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Search products by name with pagination
    Page<Product> findByNameContainingIgnoreCase(String term, Pageable pageable);

    // Combined search by name and category with pagination
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(String term, Long categoryId, Pageable pageable);
    
    // Find products with low stock
    List<Product> findByStockLessThan(Integer stock);
    
    // Search by name or description
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
    
    // Find top products by stock (popularity proxy)
    @Query("SELECT p FROM Product p ORDER BY p.stock DESC")
    List<Product> findTop10ByOrderByStockDesc();
    
    // Efficiently load products with categories and images
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.images")
    List<Product> findAllWithCategoryAndImages();
    
    // Find a single product with category and images
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.images WHERE p.id = ?1")
    Optional<Product> findByIdWithCategoryAndImages(Long id);
}