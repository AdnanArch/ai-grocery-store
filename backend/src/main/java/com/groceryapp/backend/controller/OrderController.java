package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderRepository orderRepo;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderRepo.save(order);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return orderRepo.findById(id).map(existing -> {
            order.setId(id);
            return ResponseEntity.ok(orderRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}