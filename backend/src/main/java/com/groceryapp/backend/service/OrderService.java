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
            // Validate required fields
            validateOrderRequest(orderRequest);
            
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Extract order data with null safety
            @SuppressWarnings("unchecked")
            Map<String, Object> shippingAddressData = (Map<String, Object>) orderRequest.get("shippingAddress");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> orderItemsData = (List<Map<String, Object>>) orderRequest.get("orderItems");
            
            // Extract numeric values with null safety
            BigDecimal subtotal = extractBigDecimal(orderRequest, "subtotal");
            BigDecimal shippingCost = extractBigDecimal(orderRequest, "shippingCost");
            BigDecimal tax = extractBigDecimal(orderRequest, "tax");
            BigDecimal discount = extractBigDecimal(orderRequest, "discount");
            BigDecimal total = extractBigDecimal(orderRequest, "total");

            // Create or get shipping address
            Address shippingAddress = createShippingAddress(shippingAddressData, user);

            // Validate and process order items
            List<OrderItem> orderItems = processOrderItems(orderItemsData);

            // Create order
            Order order = Order.builder()
                    .user(user)
                    .shippingAddress(shippingAddress)
                    .totalAmount(total)
                    .subtotal(subtotal)
                    .shippingCost(shippingCost)
                    .tax(tax)
                    .discount(discount)
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

    /**
     * Validates that all required fields are present in the order request
     */
    private void validateOrderRequest(Map<String, Object> orderRequest) {
        if (orderRequest == null) {
            throw new RuntimeException("Order request cannot be null");
        }

        // Check required fields
        String[] requiredFields = {"shippingAddress", "orderItems", "subtotal", "shippingCost", "tax", "discount", "total"};
        for (String field : requiredFields) {
            if (!orderRequest.containsKey(field) || orderRequest.get(field) == null) {
                throw new RuntimeException("Required field '" + field + "' is missing or null");
            }
        }

        // Validate shipping address
        @SuppressWarnings("unchecked")
        Map<String, Object> shippingAddress = (Map<String, Object>) orderRequest.get("shippingAddress");
        if (shippingAddress == null) {
            throw new RuntimeException("Shipping address data is missing");
        }

        String[] addressFields = {"address", "city", "state", "zipCode", "country"};
        for (String field : addressFields) {
            if (!shippingAddress.containsKey(field) || shippingAddress.get(field) == null) {
                throw new RuntimeException("Required address field '" + field + "' is missing or null");
            }
        }

        // Validate order items
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> orderItems = (List<Map<String, Object>>) orderRequest.get("orderItems");
        if (orderItems == null || orderItems.isEmpty()) {
            throw new RuntimeException("Order items cannot be null or empty");
        }

        for (int i = 0; i < orderItems.size(); i++) {
            Map<String, Object> item = orderItems.get(i);
            if (item == null) {
                throw new RuntimeException("Order item at index " + i + " is null");
            }

            String[] itemFields = {"productId", "quantity", "price"};
            for (String field : itemFields) {
                if (!item.containsKey(field) || item.get(field) == null) {
                    throw new RuntimeException("Required order item field '" + field + "' is missing or null at index " + i);
                }
            }
        }
    }

    /**
     * Safely extracts BigDecimal values from the request map
     */
    private BigDecimal extractBigDecimal(Map<String, Object> request, String fieldName) {
        Object value = request.get(fieldName);
        if (value == null) {
            throw new RuntimeException("Field '" + fieldName + "' is null");
        }
        
        try {
            if (value instanceof Number) {
                return new BigDecimal(value.toString());
            } else if (value instanceof String) {
                return new BigDecimal((String) value);
            } else {
                throw new RuntimeException("Field '" + fieldName + "' must be a number or string, got: " + value.getClass().getSimpleName());
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Field '" + fieldName + "' contains invalid number: " + value);
        }
    }

    private Address createShippingAddress(Map<String, Object> addressData, User user) {
        Address address = Address.builder()
                .user(user)
                .street(extractString(addressData, "address"))
                .city(extractString(addressData, "city"))
                .state(extractString(addressData, "state"))
                .postalCode(extractString(addressData, "zipCode"))
                .country(extractString(addressData, "country"))
                .isDefault(false)
                .build();

        return addressRepository.save(address);
    }

    /**
     * Safely extracts string values from the address data map
     */
    private String extractString(Map<String, Object> data, String fieldName) {
        Object value = data.get(fieldName);
        if (value == null) {
            throw new RuntimeException("Address field '" + fieldName + "' is null");
        }
        
        String stringValue = value.toString().trim();
        if (stringValue.isEmpty()) {
            throw new RuntimeException("Address field '" + fieldName + "' cannot be empty");
        }
        
        return stringValue;
    }

    private List<OrderItem> processOrderItems(List<Map<String, Object>> orderItemsData) {
        return orderItemsData.stream().map(itemData -> {
            Long productId = extractLong(itemData, "productId");
            Integer quantity = extractInteger(itemData, "quantity");
            BigDecimal price = extractBigDecimal(itemData, "price");

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

    /**
     * Safely extracts Long values from the item data map
     */
    private Long extractLong(Map<String, Object> data, String fieldName) {
        Object value = data.get(fieldName);
        if (value == null) {
            throw new RuntimeException("Order item field '" + fieldName + "' is null");
        }
        
        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            } else if (value instanceof String) {
                return Long.parseLong((String) value);
            } else {
                throw new RuntimeException("Order item field '" + fieldName + "' must be a number or string, got: " + value.getClass().getSimpleName());
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Order item field '" + fieldName + "' contains invalid number: " + value);
        }
    }

    /**
     * Safely extracts Integer values from the item data map
     */
    private Integer extractInteger(Map<String, Object> data, String fieldName) {
        Object value = data.get(fieldName);
        if (value == null) {
            throw new RuntimeException("Order item field '" + fieldName + "' is null");
        }
        
        try {
            if (value instanceof Number) {
                return ((Number) value).intValue();
            } else if (value instanceof String) {
                return Integer.parseInt((String) value);
            } else {
                throw new RuntimeException("Order item field '" + fieldName + "' must be a number or string, got: " + value.getClass().getSimpleName());
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Order item field '" + fieldName + "' contains invalid number: " + value);
        }
    }

    private void updateProductStock(List<Map<String, Object>> orderItemsData) {
        for (Map<String, Object> itemData : orderItemsData) {
            Long productId = extractLong(itemData, "productId");
            Integer quantity = extractInteger(itemData, "quantity");

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
        return orderRepository.findByUserIdWithItemsAndProducts(userId);
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
