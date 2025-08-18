package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.OrderItem;
import com.groceryapp.backend.model.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {}