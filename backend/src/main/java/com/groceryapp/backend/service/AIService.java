package com.groceryapp.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class AIService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, List<Map<String, String>>> conversationContext = new HashMap<>();

    public String generateResponse(String userMessage, Long chatId) {
        try {
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                log.warn("OpenAI API key not configured, using fallback response");
                return generateFallbackResponse(userMessage);
            }
            
            return callOpenAIAPI(userMessage, chatId);
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}, using fallback response", e.getMessage());
            return generateFallbackResponse(userMessage);
        }
    }

    private String callOpenAIAPI(String userMessage, Long chatId) {
        String chatIdStr = chatId.toString();
        List<Map<String, String>> messages = conversationContext.getOrDefault(chatIdStr, new ArrayList<>());
        
        // Add system message if this is a new conversation
        if (messages.isEmpty()) {
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", getSystemPrompt());
            messages.add(systemMessage);
        }
        
        // Add user message
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);
        
        // Prepare request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openaiModel);
        requestBody.put("messages", messages);
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.7);
        requestBody.put("top_p", 1.0);
        requestBody.put("frequency_penalty", 0.0);
        requestBody.put("presence_penalty", 0.0);
        
        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(openaiApiUrl, request, Map.class);
            
            // Check for error responses
            if (response.getBody() != null && response.getBody().containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) response.getBody().get("error");
                String errorMessage = (String) error.get("message");
                String errorType = (String) error.get("type");
                
                log.error("OpenAI API error: {} - {}", errorType, errorMessage);
                
                // Check for quota exceeded error
                if ("insufficient_quota".equals(errorType) || errorMessage.contains("quota")) {
                    throw new RuntimeException("insufficient_quota: " + errorMessage);
                }
                
                throw new RuntimeException("OpenAI API error: " + errorMessage);
            }
            
            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    String aiResponse = (String) message.get("content");
                    
                    // Add AI response to conversation context
                    Map<String, String> aiMsg = new HashMap<>();
                    aiMsg.put("role", "assistant");
                    aiMsg.put("content", aiResponse);
                    messages.add(aiMsg);
                    
                    // Keep only last 10 messages to manage context length
                    if (messages.size() > 10) {
                        messages = messages.subList(messages.size() - 10, messages.size());
                    }
                    
                    conversationContext.put(chatIdStr, messages);
                    return aiResponse;
                }
            }
            
            throw new RuntimeException("Invalid response from OpenAI API");
            
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            throw e;
        }
    }

    private String getSystemPrompt() {
        return "You are GroceryAI, a knowledgeable and helpful AI assistant specializing in food, nutrition, cooking, and grocery shopping. " +
               "Your role is to provide accurate, practical, and helpful advice to users about:\n\n" +
               "1. **Cooking & Recipes** 🍳: Provide detailed recipes, cooking tips, meal ideas, and cooking techniques\n" +
               "2. **Nutrition** 🥗: Offer evidence-based nutrition advice, explain health benefits, and provide dietary guidance\n" +
               "3. **Grocery Shopping** 🛒: Help with product selection, budget tips, seasonal buying, and shopping strategies\n" +
               "4. **Food Storage** 📦: Provide tips on how to store and preserve different types of food\n" +
               "5. **Organic vs Conventional** 🌱: Explain differences, benefits, and help users make informed choices\n" +
               "6. **Allergens & Substitutes** ⚠️: Suggest alternatives for common allergens and dietary restrictions\n" +
               "7. **Budget-Friendly Options** 💰: Provide cost-effective meal planning and shopping advice\n" +
               "8. **Seasonal Eating** 🌸: Guide users on what's in season and when to buy certain foods\n" +
               "9. **Meal Prep** ⏰: Help with planning, batch cooking, and time-saving strategies\n" +
               "10. **Food Safety** 🧤: Provide guidance on food handling, storage, and safety practices\n\n" +
               "**Guidelines for your responses:**\n" +
               "- Be specific and actionable in your advice\n" +
               "- Use emojis and formatting to make responses engaging and easy to read\n" +
               "- Provide practical tips that users can implement immediately\n" +
               "- Include relevant nutritional information when appropriate\n" +
               "- Consider budget constraints and suggest affordable options\n" +
               "- Be encouraging and supportive in your tone\n" +
               "- Ask follow-up questions when appropriate to better understand user needs\n" +
               "- Provide step-by-step instructions for recipes and cooking methods\n" +
               "- Include safety tips and best practices\n" +
               "- Personalize responses based on user's previous messages in the conversation\n\n" +
               "**Response format:**\n" +
               "- Use clear headings and bullet points\n" +
               "- Include relevant emojis for visual appeal\n" +
               "- Provide specific measurements and cooking times\n" +
               "- Include tips and variations when helpful\n" +
               "- Keep responses informative but concise (max 500 words)\n" +
               "- End with a helpful follow-up question when appropriate\n\n" +
               "**Special features:**\n" +
               "- If asked about recipes, provide ingredient lists and step-by-step instructions\n" +
               "- If asked about nutrition, include calorie and macro information when relevant\n" +
               "- If asked about shopping, suggest specific products and price ranges\n" +
               "- If asked about storage, provide shelf life and preservation methods\n\n" +
               "Remember to be helpful, accurate, and encouraging in all your responses about food and grocery topics. " +
               "You're here to make cooking and grocery shopping easier and more enjoyable!";
    }

    private String generateFallbackResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        // Simple keyword-based responses when AI is unavailable
        if (lowerMessage.contains("breakfast") || lowerMessage.contains("morning")) {
            return "🍳 **Quick Breakfast Ideas**\n\n" +
                   "• **Overnight Oats**: Mix 1/2 cup oats with 1/2 cup milk, add honey and berries, refrigerate overnight\n" +
                   "• **Smoothie Bowl**: Blend banana, berries, and yogurt, top with granola and nuts\n" +
                   "• **Avocado Toast**: Toast whole grain bread, spread mashed avocado, add salt and pepper\n\n" +
                   "These are healthy, quick options that will give you energy for the day! 💪\n\n" +
                   "Would you like me to suggest more breakfast ideas or help with meal planning?";
        }
        
        if (lowerMessage.contains("recipe") || lowerMessage.contains("cook") || lowerMessage.contains("meal")) {
            return "👨‍🍳 **Simple Recipe Suggestions**\n\n" +
                   "• **Pasta Primavera**: Cook pasta, sauté mixed vegetables, combine with olive oil and herbs\n" +
                   "• **Stir-Fry**: Quick-cook vegetables and protein in a hot wok with soy sauce\n" +
                   "• **Sheet Pan Dinner**: Place chicken, potatoes, and vegetables on a baking sheet, roast at 400°F for 25 minutes\n\n" +
                   "These recipes are beginner-friendly and can be customized with your favorite ingredients! 🌟\n\n" +
                   "What type of cuisine are you interested in cooking?";
        }
        
        if (lowerMessage.contains("healthy") || lowerMessage.contains("nutrition")) {
            return "🥗 **Nutrition Tips**\n\n" +
                   "• **Eat the Rainbow**: Include colorful fruits and vegetables for diverse nutrients\n" +
                   "• **Protein Balance**: Include lean proteins like chicken, fish, beans, or tofu\n" +
                   "• **Whole Grains**: Choose brown rice, quinoa, or whole wheat bread over refined grains\n" +
                   "• **Healthy Fats**: Include nuts, avocados, and olive oil in moderation\n\n" +
                   "Remember, balance and variety are key to good nutrition! 🎯\n\n" +
                   "Do you have specific dietary goals or restrictions I can help with?";
        }
        
        if (lowerMessage.contains("shopping") || lowerMessage.contains("grocery") || lowerMessage.contains("buy")) {
            return "🛒 **Smart Grocery Shopping Tips**\n\n" +
                   "• **Make a List**: Plan meals and create a shopping list to avoid impulse buys\n" +
                   "• **Shop the Perimeter**: Fresh produce, dairy, and meat are usually around the edges\n" +
                   "• **Buy Seasonal**: Seasonal produce is often fresher and more affordable\n" +
                   "• **Check Unit Prices**: Compare prices per ounce/pound for the best deals\n" +
                   "• **Bring Reusable Bags**: Save money and help the environment\n\n" +
                   "Smart shopping can save you money and reduce food waste! 💰\n\n" +
                   "What's on your shopping list today?";
        }
        
        if (lowerMessage.contains("storage") || lowerMessage.contains("preserve") || lowerMessage.contains("keep")) {
            return "📦 **Food Storage Tips**\n\n" +
                   "• **Refrigerate**: Dairy, meat, and cut vegetables (2-7 days)\n" +
                   "• **Freeze**: Bread, meat, and cooked meals (3-6 months)\n" +
                   "• **Pantry**: Dry goods like pasta, rice, and canned foods (6-12 months)\n" +
                   "• **Counter**: Bananas, tomatoes, and avocados (ripen at room temperature)\n\n" +
                   "Proper storage keeps food fresh longer and saves money! 🎯\n\n" +
                   "What specific food item would you like storage advice for?";
        }
        
        // Default response
        return "🤖 **Hello! I'm GroceryAI**\n\n" +
               "I'm here to help you with:\n" +
               "• 🍳 Cooking and recipes\n" +
               "• 🥗 Nutrition advice\n" +
               "• 🛒 Grocery shopping tips\n" +
               "• 📦 Food storage\n" +
               "• 💰 Budget-friendly options\n\n" +
               "Currently, I'm running in fallback mode. You can still get helpful tips and suggestions!\n\n" +
               "What would you like to know about food, cooking, or grocery shopping?";
    }

}
