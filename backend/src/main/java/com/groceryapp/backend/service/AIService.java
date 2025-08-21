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
                log.warn("OpenAI API key not configured, falling back to local responses");
                return generateLocalResponse(userMessage, chatId);
            }
            
            return callOpenAIAPI(userMessage, chatId);
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            return generateLocalResponse(userMessage, chatId);
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
        return "You are a knowledgeable and helpful AI assistant specializing in food, nutrition, cooking, and grocery shopping. " +
               "Your role is to provide accurate, practical, and helpful advice to users about:\n\n" +
               "1. **Cooking & Recipes**: Provide detailed recipes, cooking tips, meal ideas, and cooking techniques\n" +
               "2. **Nutrition**: Offer evidence-based nutrition advice, explain health benefits, and provide dietary guidance\n" +
               "3. **Grocery Shopping**: Help with product selection, budget tips, seasonal buying, and shopping strategies\n" +
               "4. **Food Storage**: Provide tips on how to store and preserve different types of food\n" +
               "5. **Organic vs Conventional**: Explain differences, benefits, and help users make informed choices\n" +
               "6. **Allergens & Substitutes**: Suggest alternatives for common allergens and dietary restrictions\n" +
               "7. **Budget-Friendly Options**: Provide cost-effective meal planning and shopping advice\n" +
               "8. **Seasonal Eating**: Guide users on what's in season and when to buy certain foods\n" +
               "9. **Meal Prep**: Help with planning, batch cooking, and time-saving strategies\n" +
               "10. **Food Safety**: Provide guidance on food handling, storage, and safety practices\n\n" +
               "**Guidelines for your responses:**\n" +
               "- Be specific and actionable in your advice\n" +
               "- Use emojis and formatting to make responses engaging and easy to read\n" +
               "- Provide practical tips that users can implement immediately\n" +
               "- Include relevant nutritional information when appropriate\n" +
               "- Consider budget constraints and suggest affordable options\n" +
               "- Be encouraging and supportive in your tone\n" +
               "- Ask follow-up questions when appropriate to better understand user needs\n" +
               "- Provide step-by-step instructions for recipes and cooking methods\n" +
               "- Include safety tips and best practices\n\n" +
               "**Response format:**\n" +
               "- Use clear headings and bullet points\n" +
               "- Include relevant emojis for visual appeal\n" +
               "- Provide specific measurements and cooking times\n" +
               "- Include tips and variations when helpful\n" +
               "- Keep responses informative but concise\n\n" +
               "Remember to be helpful, accurate, and encouraging in all your responses about food and grocery topics.";
    }

    private String generateLocalResponse(String userMessage, Long chatId) {
        String message = userMessage.toLowerCase().trim();
        
        // Fallback responses when OpenAI API is not available
        if (message.contains("recipe") || message.contains("cook") || message.contains("meal")) {
            return "🍳 **Recipe Help**\n\n" +
                   "I'd love to help you with recipes! To give you the best suggestions, could you tell me:\n\n" +
                   "• What type of cuisine you prefer\n" +
                   "• Any dietary restrictions (vegetarian, gluten-free, etc.)\n" +
                   "• How much time you have to cook\n" +
                   "• What ingredients you have available\n\n" +
                   "For example: \"I want a quick vegetarian dinner using spinach, tomatoes, and pasta\"\n\n" +
                   "💡 **Tip**: I can provide detailed recipes with step-by-step instructions, cooking tips, and nutritional information!";
        } else if (message.contains("nutrition") || message.contains("calorie") || message.contains("vitamin")) {
            return "🥬 **Nutrition Information**\n\n" +
                   "I can help you with nutrition questions! Here are some topics I can cover:\n\n" +
                   "• **Macronutrients**: Protein, carbs, and healthy fats\n" +
                   "• **Vitamins & Minerals**: Sources and benefits\n" +
                   "• **Calorie Information**: For different foods and meals\n" +
                   "• **Health Benefits**: Of specific foods and ingredients\n" +
                   "• **Dietary Guidelines**: For different health goals\n\n" +
                   "What specific nutrition topic would you like to know more about?\n\n" +
                   "💡 **Tip**: I can provide detailed nutritional analysis and help you make healthier food choices!";
        } else if (message.contains("organic") || message.contains("conventional")) {
            return "🌱 **Organic vs Conventional**\n\n" +
                   "Great question! Here's what you should know:\n\n" +
                   "**Organic Benefits:**\n" +
                   "✅ No synthetic pesticides or herbicides\n" +
                   "✅ No GMOs\n" +
                   "✅ Better for environment\n" +
                   "✅ Higher antioxidant levels in some studies\n\n" +
                   "**Conventional Benefits:**\n" +
                   "💰 Generally 20-40% cheaper\n" +
                   "📦 More widely available\n\n" +
                   "**The Dirty Dozen** (Buy Organic):\n" +
                   "Strawberries, spinach, kale, nectarines, apples, grapes, peaches, cherries, pears, tomatoes, celery, potatoes\n\n" +
                   "**The Clean Fifteen** (Conventional OK):\n" +
                   "Avocados, sweet corn, pineapples, onions, papayas, sweet peas, eggplants, asparagus, cauliflower, cantaloupes, broccoli, mushrooms, cabbage, honeydew melons, kiwis\n\n" +
                   "💡 **Recommendation**: Prioritize organic for the Dirty Dozen, conventional is fine for the Clean Fifteen!";
        } else if (message.contains("store") || message.contains("fresh") || message.contains("preserve")) {
            return "📦 **Food Storage Tips**\n\n" +
                   "Here are some key storage guidelines:\n\n" +
                   "**Refrigerator (32-40°F):**\n" +
                   "🥬 Leafy greens: Wrap in damp paper towel\n" +
                   "🍎 Apples: Store in crisper drawer\n" +
                   "🥕 Carrots: Remove tops, store in plastic bag\n" +
                   "🥛 Dairy: Keep in coldest part\n\n" +
                   "**Room Temperature:**\n" +
                   "🍅 Tomatoes: Keep out until ripe\n" +
                   "🍌 Bananas: Store on counter\n" +
                   "🥔 Potatoes: Cool, dark place\n\n" +
                   "**Freezer:**\n" +
                   "🥩 Meat: 3-6 months\n" +
                   "🐟 Fish: 3-6 months\n" +
                   "🥬 Vegetables: 8-12 months\n\n" +
                   "💡 **Pro Tip**: Don't wash produce until ready to use, and use the 'first in, first out' rule!";
        } else if (message.contains("shopping") || message.contains("grocery") || message.contains("buy")) {
            return "🛒 **Smart Grocery Shopping**\n\n" +
                   "Here are some strategies to help you shop smarter:\n\n" +
                   "**Before Shopping:**\n" +
                   "📝 Plan meals and make a list\n" +
                   "💰 Set a budget\n" +
                   "🍽️ Check what you already have\n\n" +
                   "**At the Store:**\n" +
                   "🕐 Shop early morning for freshest produce\n" +
                   "🛒 Start with perimeter (produce, dairy, meat)\n" +
                   "👀 Check expiration dates\n" +
                   "🏷️ Compare unit prices\n\n" +
                   "**Money-Saving Tips:**\n" +
                   "• Use store loyalty programs\n" +
                   "• Buy store brands\n" +
                   "• Purchase in bulk for non-perishables\n" +
                   "• Buy seasonal produce\n\n" +
                   "💡 **Pro Tip**: Never shop hungry - you'll buy more than you need!";
        } else {
            return "👋 **Welcome to Your Food & Grocery Assistant!**\n\n" +
                   "I'm here to help you with all things food and grocery related. I can assist with:\n\n" +
                   "🍳 **Cooking & Recipes**: Meal ideas, cooking techniques, recipe help\n" +
                   "🥬 **Nutrition**: Health benefits, vitamin information, dietary advice\n" +
                   "🛒 **Shopping**: Product selection, budget tips, seasonal buying\n" +
                   "📦 **Storage**: Food preservation, shelf life, organization\n" +
                   "🌱 **Organic vs Conventional**: Benefits, cost comparisons\n" +
                   "🚫 **Allergens**: Substitutes, alternatives, safe cooking\n" +
                   "💰 **Budget**: Money-saving strategies, affordable meal planning\n" +
                   "🌿 **Seasonal**: What's in season, best times to buy\n" +
                   "🍽️ **Meal Prep**: Planning, batch cooking, time-saving\n" +
                   "🐟 **Seafood**: Selection, cooking methods, safety\n" +
                   "🥛 **Dairy**: Types, storage, alternatives\n" +
                   "🥬 **Produce**: Selection, storage, seasonal availability\n" +
                   "🥩 **Meat**: Cuts, cooking methods, quality indicators\n\n" +
                   "**Just ask me anything specific!** For example:\n" +
                   "• \"What's a quick healthy dinner recipe?\"\n" +
                   "• \"How do I store fresh vegetables?\"\n" +
                   "• \"What's the difference between organic and conventional?\"\n" +
                   "• \"Give me budget-friendly meal ideas\"\n\n" +
                   "💡 **Tip**: The more specific your question, the better I can help you!";
        }
    }
}
