package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.AIChat;
import com.groceryapp.backend.model.AIMessage;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.AIChatRepository;
import com.groceryapp.backend.repository.AIMessageRepository;
import com.groceryapp.backend.repository.UserRepository;
import com.groceryapp.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIChatController {

    private final AIService aiService;
    private final AIChatRepository aiChatRepository;
    private final AIMessageRepository aiMessageRepository;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    @Transactional
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            // Extract user email from authentication and fetch the actual user
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String message = (String) request.get("message");
            
            // Handle chatId as either String or Integer to prevent ClassCastException
            Object chatIdObj = request.get("chatId");
            String chatId = null;
            if (chatIdObj != null) {
                if (chatIdObj instanceof String) {
                    chatId = (String) chatIdObj;
                } else if (chatIdObj instanceof Integer) {
                    chatId = String.valueOf(chatIdObj);
                } else if (chatIdObj instanceof Long) {
                    chatId = String.valueOf(chatIdObj);
                }
            }

            // Get or create chat session
            AIChat chat;
            if (chatId != null && !chatId.isEmpty()) {
                try {
                    Optional<AIChat> existingChat = aiChatRepository.findById(Long.valueOf(chatId));
                    chat = existingChat.orElseGet(() -> createNewChat(user));
                } catch (NumberFormatException e) {
                    log.warn("Invalid chatId format: {}, creating new chat", chatId);
                    chat = createNewChat(user);
                }
            } else {
                chat = createNewChat(user);
            }

            // Save user message
            AIMessage userMessage = AIMessage.builder()
                    .chat(chat)
                    .content(message)
                    .sender("user")
                    .timestamp(LocalDateTime.now())
                    .build();
            aiMessageRepository.save(userMessage);

            // Get AI response
            String aiResponse = aiService.generateResponse(message, chat.getId());

            // Save AI message
            AIMessage aiMessage = AIMessage.builder()
                    .chat(chat)
                    .content(aiResponse)
                    .sender("ai")
                    .timestamp(LocalDateTime.now())
                    .build();
            aiMessageRepository.save(aiMessage);

            // Update chat with truncated last message (for display purposes)
            String truncatedMessage = aiResponse.length() > 200 ? 
                aiResponse.substring(0, 200) + "..." : aiResponse;
            chat.setLastMessage(truncatedMessage);
            chat.setUpdatedAt(LocalDateTime.now());
            aiChatRepository.save(chat);

            Map<String, Object> response = new HashMap<>();
            response.put("response", aiResponse);
            response.put("chatId", chat.getId().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in chat endpoint: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to process chat message");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/chat-history")
    public ResponseEntity<List<AIChat>> getChatHistory(Authentication authentication) {
        try {
            // Extract user email from authentication and fetch the actual user
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<AIChat> chats = aiChatRepository.findByUserOrderByUpdatedAtDesc(user);
            return ResponseEntity.ok(chats);
        } catch (Exception e) {
            log.error("Error getting chat history: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<Map<String, Object>> getChat(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Extract user email from authentication and fetch the actual user
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Optional<AIChat> chat = aiChatRepository.findByIdAndUser(chatId, user);
            
            if (chat.isPresent()) {
                List<AIMessage> messages = aiMessageRepository.findByChatOrderByTimestampAsc(chat.get());
                
                Map<String, Object> response = new HashMap<>();
                response.put("chat", chat.get());
                response.put("messages", messages);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting chat: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/chat/{chatId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteChat(@PathVariable Long chatId, Authentication authentication) {
        try {
            // Extract user email from authentication and fetch the actual user
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Optional<AIChat> chat = aiChatRepository.findByIdAndUser(chatId, user);
            
            if (chat.isPresent()) {
                // Delete messages first
                aiMessageRepository.deleteByChat(chat.get());
                // Then delete the chat
                aiChatRepository.delete(chat.get());
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Chat deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error deleting chat: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete chat");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/chat/save")
    @Transactional
    public ResponseEntity<Map<String, Object>> saveChat(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            // Extract user email from authentication and fetch the actual user
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Handle chatId as either String or Integer to prevent ClassCastException
            Object chatIdObj = request.get("chatId");
            String chatId = null;
            if (chatIdObj != null) {
                if (chatIdObj instanceof String) {
                    chatId = (String) chatIdObj;
                } else if (chatIdObj instanceof Integer) {
                    chatId = String.valueOf(chatIdObj);
                } else if (chatIdObj instanceof Long) {
                    chatId = String.valueOf(chatIdObj);
                }
            }
            
            String title = (String) request.get("title");
            
            if (chatId != null && !chatId.isEmpty()) {
                try {
                    Optional<AIChat> chat = aiChatRepository.findByIdAndUser(Long.valueOf(chatId), user);
                    if (chat.isPresent()) {
                        chat.get().setTitle(title);
                        aiChatRepository.save(chat.get());
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Chat saved successfully");
                        return ResponseEntity.ok(response);
                    }
                } catch (NumberFormatException e) {
                    log.warn("Invalid chatId format: {}", chatId);
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid chat ID format"));
                }
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error saving chat: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to save chat");
            return ResponseEntity.badRequest().body(error);
        }
    }

    private AIChat createNewChat(User user) {
        AIChat chat = AIChat.builder()
                .user(user)
                .title("New Chat")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return aiChatRepository.save(chat);
    }

    // Placeholder endpoints for AI recommendations and preferences (from previous AIRecommendationsController)
    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences(Authentication authentication) {
        try {
            Map<String, Object> preferences = new HashMap<>();
            preferences.put("categories", Arrays.asList("Fruits", "Vegetables", "Dairy", "Bakery", "Meat"));
            preferences.put("priceRange", "medium");
            preferences.put("dietaryRestrictions", Arrays.asList("Vegetarian"));
            preferences.put("allergies", Arrays.asList("Nuts"));
            preferences.put("cookingStyle", "Quick & Easy");
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            log.error("Error getting preferences: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(Authentication authentication) {
        try {
            // Mock product data for recommendations
            Map<String, Object> mockProduct1 = new HashMap<>();
            mockProduct1.put("id", 1L);
            mockProduct1.put("name", "Organic Bananas");
            mockProduct1.put("price", 299.0);
            mockProduct1.put("originalPrice", 399.0);
            mockProduct1.put("description", "Fresh organic bananas, perfect for smoothies and healthy snacks");
            mockProduct1.put("category", Map.of("name", "Fruits"));
            mockProduct1.put("stock", 50);
            mockProduct1.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400")));

            Map<String, Object> mockProduct2 = new HashMap<>();
            mockProduct2.put("id", 2L);
            mockProduct2.put("name", "Fresh Spinach");
            mockProduct2.put("price", 199.0);
            mockProduct2.put("originalPrice", 199.0);
            mockProduct2.put("description", "Nutrient-rich spinach leaves, great for salads and cooking");
            mockProduct2.put("category", Map.of("name", "Vegetables"));
            mockProduct2.put("stock", 30);
            mockProduct2.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400")));

            Map<String, Object> mockProduct3 = new HashMap<>();
            mockProduct3.put("id", 3L);
            mockProduct3.put("name", "Greek Yogurt");
            mockProduct3.put("price", 450.0);
            mockProduct3.put("originalPrice", 550.0);
            mockProduct3.put("description", "Creamy Greek yogurt with probiotics, perfect for breakfast");
            mockProduct3.put("category", Map.of("name", "Dairy"));
            mockProduct3.put("stock", 25);
            mockProduct3.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400")));

            Map<String, Object> mockProduct4 = new HashMap<>();
            mockProduct4.put("id", 4L);
            mockProduct4.put("name", "Whole Grain Bread");
            mockProduct4.put("price", 180.0);
            mockProduct4.put("originalPrice", 180.0);
            mockProduct4.put("description", "Freshly baked whole grain bread, rich in fiber");
            mockProduct4.put("category", Map.of("name", "Bakery"));
            mockProduct4.put("stock", 40);
            mockProduct4.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400")));

            Map<String, Object> mockProduct5 = new HashMap<>();
            mockProduct5.put("id", 5L);
            mockProduct5.put("name", "Organic Chicken Breast");
            mockProduct5.put("price", 899.0);
            mockProduct5.put("originalPrice", 1099.0);
            mockProduct5.put("description", "Premium organic chicken breast, hormone-free and fresh");
            mockProduct5.put("category", Map.of("name", "Meat"));
            mockProduct5.put("stock", 15);
            mockProduct5.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400")));

            Map<String, Object> mockProduct6 = new HashMap<>();
            mockProduct6.put("id", 6L);
            mockProduct6.put("name", "Avocados");
            mockProduct6.put("price", 350.0);
            mockProduct6.put("originalPrice", 350.0);
            mockProduct6.put("description", "Ripe avocados, perfect for guacamole and healthy fats");
            mockProduct6.put("category", Map.of("name", "Fruits"));
            mockProduct6.put("stock", 35);
            mockProduct6.put("images", Arrays.asList(Map.of("url", "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400")));

            Map<String, Object> recommendations = new HashMap<>();
            recommendations.put("personalized", Arrays.asList(mockProduct1, mockProduct2, mockProduct3));
            recommendations.put("trending", Arrays.asList(mockProduct4, mockProduct5, mockProduct6));
            recommendations.put("similar", Arrays.asList(mockProduct1, mockProduct3, mockProduct4));
            recommendations.put("seasonal", Arrays.asList(mockProduct2, mockProduct5, mockProduct6));
            
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error getting recommendations: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
