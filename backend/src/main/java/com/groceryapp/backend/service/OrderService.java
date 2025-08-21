package com.groceryapp.backend.service;

import com.groceryapp.backend.model.*;
import com.groceryapp.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final EmailService emailService;

    @Transactional
    public Order createOrder(Map<String, Object> orderRequest) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Extract order data
            @SuppressWarnings("unchecked")
            Map<String, Object> shippingAddressData = (Map<String, Object>) orderRequest.get("shippingAddress");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> orderItemsData = (List<Map<String, Object>>) orderRequest.get("orderItems");
            
            BigDecimal subtotal = new BigDecimal(orderRequest.get("subtotal").toString());
            BigDecimal shippingCost = new BigDecimal(orderRequest.get("shippingCost").toString());
            BigDecimal tax = new BigDecimal(orderRequest.get("tax").toString());
            BigDecimal discount = new BigDecimal(orderRequest.get("discount").toString());
            BigDecimal total = new BigDecimal(orderRequest.get("total").toString());

            // Create or get shipping address
            Address shippingAddress = createShippingAddress(shippingAddressData, user);

            // Validate and process order items
            List<OrderItem> orderItems = processOrderItems(orderItemsData);

            // Create order
            Order order = Order.builder()
                    .user(user)
                    .shippingAddress(shippingAddress)
                    .totalAmount(total)
                    .status("PENDING")
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Save order items
            for (OrderItem item : orderItems) {
                item.setOrder(savedOrder);
                orderItemRepository.save(item);
            }

            // Update product stock
            updateProductStock(orderItemsData);

            log.info("Order created successfully: {}", savedOrder.getId());
            return savedOrder;

        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    private Address createShippingAddress(Map<String, Object> addressData, User user) {
        Address address = Address.builder()
                .user(user)
                .street(addressData.get("address").toString())
                .city(addressData.get("city").toString())
                .state(addressData.get("state").toString())
                .postalCode(addressData.get("zipCode").toString())
                .country(addressData.get("country").toString())
                .isDefault(false)
                .build();

        return addressRepository.save(address);
    }

    private List<OrderItem> processOrderItems(List<Map<String, Object>> orderItemsData) {
        return orderItemsData.stream().map(itemData -> {
            Long productId = Long.valueOf(itemData.get("productId").toString());
            Integer quantity = Integer.valueOf(itemData.get("quantity").toString());
            BigDecimal price = new BigDecimal(itemData.get("price").toString());

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            // Validate stock
            if (product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItemId orderItemId = OrderItemId.builder()
                    .orderId(0L) // Will be set after order creation
                    .productId(productId)
                    .build();

            return OrderItem.builder()
                    .id(orderItemId)
                    .product(product)
                    .quantity(quantity)
                    .price(price)
                    .build();
        }).collect(Collectors.toList());
    }

    private void updateProductStock(List<Map<String, Object>> orderItemsData) {
        for (Map<String, Object> itemData : orderItemsData) {
            Long productId = Long.valueOf(itemData.get("productId").toString());
            Integer quantity = Integer.valueOf(itemData.get("quantity").toString());

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        }
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        order.setUpdatedAt(Instant.now());
        
        Order updatedOrder = orderRepository.save(order);
        
        // Send email notification if order is confirmed
        if ("CONFIRMED".equals(status)) {
            emailService.sendOrderConfirmationEmail(updatedOrder, order.getUser());
        }
        
        return updatedOrder;
    }
}
