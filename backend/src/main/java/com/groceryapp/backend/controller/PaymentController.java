package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.model.Payment;
import com.groceryapp.backend.model.PaymentMethod;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.OrderRepository;
import com.groceryapp.backend.repository.PaymentRepository;
import com.groceryapp.backend.repository.PaymentMethodRepository;
import com.groceryapp.backend.service.StripeService;
import com.stripe.model.PaymentIntent;
import com.stripe.model.SetupIntent;
import com.stripe.model.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final StripeService stripeService;

    // Create Stripe PaymentIntent
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String customerEmail = (String) request.get("customerEmail");
            String currency = (String) request.getOrDefault("currency", "pkr");
            String description = "Order #" + orderId;

            PaymentIntent paymentIntent = stripeService.createPaymentIntent(amount, currency, customerEmail, description);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("amount", amount);
            response.put("currency", currency);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update order payment status
    @PutMapping("/orders/{orderId}/payment-status")
    public ResponseEntity<Order> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String status = request.get("status");
        String txnRefNumber = request.get("txnRefNumber");
        String responseCode = request.get("responseCode");

        // Verify payment with Stripe
        PaymentIntent paymentIntent = stripeService.getPaymentIntent(txnRefNumber);
        
        if ("succeeded".equals(paymentIntent.getStatus())) {
            order.setStatus("PAID");

            // Save payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .method("STRIPE")
                    .transactionId(paymentIntent.getId())
                    .status("COMPLETED")
                    .build();

            paymentRepository.save(payment);
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(updatedOrder);
        } else {
            order.setStatus("PAYMENT_FAILED");
            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.badRequest().body(updatedOrder);
        }
    }

    // Get payment history for an order
    @GetMapping("/orders/{orderId}/payments")
    public ResponseEntity<Map<String, Object>> getOrderPayments(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // In a real implementation, you would fetch payments from the database
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("payments", new java.util.ArrayList<>()); // Placeholder

        return ResponseEntity.ok(response);
    }

    // Process refund
    @PostMapping("/refund")
    public ResponseEntity<Map<String, Object>> processRefund(@RequestBody Map<String, Object> request) {
        try {
            String paymentIntentId = (String) request.get("paymentIntentId");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String reason = (String) request.getOrDefault("reason", "requested_by_customer");

            com.stripe.model.Refund refund = stripeService.createRefund(paymentIntentId, amount, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("refundId", refund.getId());
            response.put("status", refund.getStatus());
            response.put("amount", stripeService.convertFromStripeAmount(refund.getAmount()));
            response.put("message", "Refund processed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get payment methods for user
    @GetMapping("/payment-methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        // In a real implementation, you would fetch saved payment methods from Stripe
        Map<String, Object> response = new HashMap<>();
        response.put("paymentMethods", new java.util.ArrayList<>()); // Placeholder

        return ResponseEntity.ok(response);
    }

    // Create Stripe Checkout Session for redirect
    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String customerEmail = (String) request.get("customerEmail");
            String successUrl = (String) request.get("successUrl");
            String cancelUrl = (String) request.get("cancelUrl");
            String currency = (String) request.getOrDefault("currency", "pkr");

            com.stripe.model.checkout.Session session = stripeService.createCheckoutSession(
                orderId, amount, currency, customerEmail, successUrl, cancelUrl
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sessionId", session.getId());
            response.put("url", session.getUrl());
            response.put("currency", session.getMetadata().get("convertedCurrency"));
            response.put("originalCurrency", session.getMetadata().get("originalCurrency"));
            response.put("originalAmount", session.getMetadata().get("originalAmount"));
            response.put("convertedAmount", session.getMetadata().get("convertedAmount"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Create SetupIntent for saving payment methods
    @PostMapping("/setup-intent")
    public ResponseEntity<Map<String, Object>> createSetupIntent(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Create or get Stripe customer
            Customer customer = stripeService.createCustomer(user.getEmail(), user.getFirstName() + " " + user.getLastName(), user.getPhone());
            
            // Create SetupIntent
            SetupIntent setupIntent = stripeService.createSetupIntent(customer.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", setupIntent.getClientSecret());
            response.put("customerId", customer.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Save payment method
    @PostMapping("/payment-methods")
    public ResponseEntity<Map<String, Object>> savePaymentMethod(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            String paymentMethodId = (String) request.get("paymentMethodId");
            String customerId = (String) request.get("customerId");
            
            // Attach payment method to customer
            com.stripe.model.PaymentMethod stripePaymentMethod = stripeService.attachPaymentMethodToCustomer(paymentMethodId, customerId);
            
            // Save to local database
            PaymentMethod paymentMethod = PaymentMethod.builder()
                    .user(user)
                    .type("CARD")
                    .last4(stripePaymentMethod.getCard().getLast4())
                    .brand(stripePaymentMethod.getCard().getBrand().toUpperCase())
                    .stripePaymentMethodId(paymentMethodId)
                    .isDefault(false)
                    .isActive(true)
                    .expiryMonth(stripePaymentMethod.getCard().getExpMonth().intValue())
                    .expiryYear(stripePaymentMethod.getCard().getExpYear().intValue())
                    .cardHolderName((String) request.get("cardHolderName"))
                    .build();
            
            paymentMethodRepository.save(paymentMethod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentMethodId", paymentMethodId);
            response.put("status", "saved");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Webhook endpoint for Stripe events
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            com.stripe.model.Event event = stripeService.constructWebhookEvent(payload, sigHeader);
            
            switch (event.getType()) {
                case "checkout.session.completed":
                    handleCheckoutSessionCompleted(event);
                    break;
                case "payment_intent.succeeded":
                    handlePaymentIntentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentIntentFailed(event);
                    break;
                case "setup_intent.succeeded":
                    handleSetupIntentSucceeded(event);
                    break;
                default:
                    log.info("Unhandled event type: {}", event.getType());
            }
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    private void handlePaymentIntentSucceeded(com.stripe.model.Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        log.info("Payment succeeded: {}", paymentIntent.getId());
        // Update order status, send confirmation email, etc.
    }

    private void handlePaymentIntentFailed(com.stripe.model.Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        log.info("Payment failed: {}", paymentIntent.getId());
        // Update order status, send failure notification, etc.
    }

    private void handleSetupIntentSucceeded(com.stripe.model.Event event) {
        SetupIntent setupIntent = (SetupIntent) event.getData().getObject();
        log.info("Setup intent succeeded: {}", setupIntent.getId());
        // Payment method saved successfully
    }

    private void handleCheckoutSessionCompleted(com.stripe.model.Event event) {
        com.stripe.model.checkout.Session session = (com.stripe.model.checkout.Session) event.getData().getObject();
        String orderId = session.getMetadata().get("orderId");
        
        if (orderId != null) {
            try {
                Long orderIdLong = Long.valueOf(orderId);
                Order order = orderRepository.findById(orderIdLong).orElse(null);
                
                if (order != null) {
                    order.setStatus("PAID");
                    orderRepository.save(order);
                    
                    // Create payment record
                    Payment payment = Payment.builder()
                            .order(order)
                            .amount(order.getTotalAmount())
                            .method("STRIPE")
                            .transactionId(session.getPaymentIntent())
                            .status("COMPLETED")
                            .build();
                    
                    paymentRepository.save(payment);
                    log.info("Order {} marked as paid via webhook", orderId);
                }
            } catch (Exception e) {
                log.error("Error processing checkout session completed: {}", e.getMessage());
            }
        }
    }
}
