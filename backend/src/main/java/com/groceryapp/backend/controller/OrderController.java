package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.service.OrderService;
import com.groceryapp.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrders() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            log.info("Fetching orders for user: {}", userEmail);
            
            // Get user by email first, then get their orders
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Order> orders = orderService.getUserOrders(user.getId());
            log.info("Found {} orders for user: {}", orders.size(), userEmail);
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching user orders: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Error fetching order: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            Order order = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage());
            
            // Return a more descriptive error response
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "An unexpected error occurred while creating the order";
            }
            
            return ResponseEntity.badRequest()
                    .body(Map.of("error", errorMessage, "timestamp", System.currentTimeMillis()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusRequest) {
        try {
            String status = statusRequest.get("status");
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            // You might want to add a delete method to OrderService
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/invoice")
    public ResponseEntity<String> generateInvoice(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            String invoiceHTML = invoiceService.generateInvoiceHTML(order);
            return ResponseEntity.ok(invoiceHTML);
        } catch (Exception e) {
            log.error("Error generating invoice: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}