package com.groceryapp.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void sendOrderUpdate(Long userId, Long orderId, String status) {
        try {
            Map<String, Object> message = Map.of(
                "type", "ORDER_UPDATE",
                "orderId", orderId,
                "status", status,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/orders",
                message
            );

            log.info("Order update sent to user {} for order {}: {}", userId, orderId, status);
        } catch (Exception e) {
            log.error("Error sending order update to user {} for order {}", userId, orderId, e);
        }
    }

    public void sendNotification(Long userId, String title, String message, String type) {
        try {
            Map<String, Object> notification = Map.of(
                "type", "NOTIFICATION",
                "title", title,
                "message", message,
                "notificationType", type,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
            );

            log.info("Notification sent to user {}: {}", userId, title);
        } catch (Exception e) {
            log.error("Error sending notification to user {}", userId, e);
        }
    }

    public void sendStockAlert(Long userId, String productName, int currentStock) {
        try {
            Map<String, Object> alert = Map.of(
                "type", "STOCK_ALERT",
                "productName", productName,
                "currentStock", currentStock,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/alerts",
                alert
            );

            log.info("Stock alert sent to user {} for product {}", userId, productName);
        } catch (Exception e) {
            log.error("Error sending stock alert to user {} for product {}", userId, productName, e);
        }
    }

    public void sendPriceDropAlert(Long userId, String productName, double oldPrice, double newPrice) {
        try {
            Map<String, Object> alert = Map.of(
                "type", "PRICE_DROP",
                "productName", productName,
                "oldPrice", oldPrice,
                "newPrice", newPrice,
                "discount", ((oldPrice - newPrice) / oldPrice) * 100,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/alerts",
                alert
            );

            log.info("Price drop alert sent to user {} for product {}", userId, productName);
        } catch (Exception e) {
            log.error("Error sending price drop alert to user {} for product {}", userId, productName, e);
        }
    }

    public void broadcastSystemMessage(String message) {
        try {
            Map<String, Object> systemMessage = Map.of(
                "type", "SYSTEM_MESSAGE",
                "message", message,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSend("/topic/system", systemMessage);
            log.info("System message broadcasted: {}", message);
        } catch (Exception e) {
            log.error("Error broadcasting system message", e);
        }
    }

    public void sendRecommendationUpdate(Long userId, String recommendationType) {
        try {
            Map<String, Object> update = Map.of(
                "type", "RECOMMENDATION_UPDATE",
                "recommendationType", recommendationType,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/recommendations",
                update
            );

            log.info("Recommendation update sent to user {}: {}", userId, recommendationType);
        } catch (Exception e) {
            log.error("Error sending recommendation update to user {}", userId, e);
        }
    }

    public void sendCartUpdate(Long userId, int itemCount, double total) {
        try {
            Map<String, Object> update = Map.of(
                "type", "CART_UPDATE",
                "itemCount", itemCount,
                "total", total,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/cart",
                update
            );

            log.info("Cart update sent to user {}: {} items, ${}", userId, itemCount, total);
        } catch (Exception e) {
            log.error("Error sending cart update to user {}", userId, e);
        }
    }
}
