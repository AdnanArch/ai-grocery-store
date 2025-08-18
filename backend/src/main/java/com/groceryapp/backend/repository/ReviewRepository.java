package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByProductId(Long productId, Pageable pageable);
    
    List<Review> findByProductId(Long productId);
    
    List<Review> findByUserId(Long userId);
    Page<Review> findByUserId(Long userId, Pageable pageable);
    
    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long getReviewCountByProductId(@Param("productId") Long productId);
    
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.rating >= :minRating ORDER BY r.createdAt DESC")
    Page<Review> findByProductIdAndRatingGreaterThanEqual(@Param("productId") Long productId, @Param("minRating") Integer minRating, Pageable pageable);
    
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId ORDER BY " +
           "CASE WHEN :sortBy = 'newest' THEN r.createdAt END DESC, " +
           "CASE WHEN :sortBy = 'oldest' THEN r.createdAt END ASC, " +
           "CASE WHEN :sortBy = 'rating-high' THEN r.rating END DESC, " +
           "CASE WHEN :sortBy = 'rating-low' THEN r.rating END ASC")
    Page<Review> findByProductIdWithSorting(@Param("productId") Long productId, @Param("sortBy") String sortBy, Pageable pageable);
}
