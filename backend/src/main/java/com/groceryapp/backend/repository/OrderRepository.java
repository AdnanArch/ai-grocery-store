package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    long countByStatus(String status);
}
