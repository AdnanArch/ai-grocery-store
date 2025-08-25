package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserId(Long userId);
    
    List<Wishlist> findByUserIdAndWishlistName(Long userId, String wishlistName);
    
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    @Query("SELECT DISTINCT w.wishlistName FROM Wishlist w WHERE w.user.id = :userId")
    List<String> findWishlistNamesByUserId(@Param("userId") Long userId);
    
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByUserId(Long userId);
}
