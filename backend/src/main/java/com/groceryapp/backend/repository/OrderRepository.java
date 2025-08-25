package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH o.shippingAddress " +
           "WHERE o.user.id = :userId " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithItemsAndProducts(@Param("userId") Long userId);
    
    long countByStatus(String status);
    void deleteByUserId(Long userId);
}
