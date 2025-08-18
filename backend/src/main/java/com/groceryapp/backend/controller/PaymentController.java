package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.model.Payment;
import com.groceryapp.backend.repository.OrderRepository;
import com.groceryapp.backend.repository.PaymentRepository;
import com.groceryapp.backend.service.JazzCashService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JazzCashService jazzCashService;

    // Create JazzCash payment request
    @PostMapping("/create-jazzcash-payment")
    public ResponseEntity<Map<String, Object>> createJazzCashPayment(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String customerEmail = (String) request.get("customerEmail");
            String customerPhone = (String) request.get("customerPhone");

            Map<String, Object> paymentRequest = jazzCashService.createPaymentRequest(orderId, amount, customerEmail, customerPhone);
            
            if ((Boolean) paymentRequest.get("success")) {
                return ResponseEntity.ok(paymentRequest);
            } else {
                return ResponseEntity.badRequest().body(paymentRequest);
            }
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

        // Verify payment with JazzCash
        Map<String, Object> verificationResult = jazzCashService.verifyPayment(txnRefNumber, responseCode);
        
        if ((Boolean) verificationResult.get("success")) {
            order.setStatus("PAID");

            // Save payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .method("JAZZCASH")
                    .transactionId(txnRefNumber)
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
            // TODO: Implement JazzCash refund when API is available
            String txnRefNumber = (String) request.get("txnRefNumber");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            // Mock refund for development
            Map<String, Object> response = new HashMap<>();
            response.put("refundId", "ref_" + System.currentTimeMillis());
            response.put("status", "succeeded");
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

    // Save payment method
    @PostMapping("/payment-methods")
    public ResponseEntity<Map<String, String>> savePaymentMethod(@RequestBody Map<String, Object> request) {
        try {
            // In a real implementation, you would save the payment method to Stripe
            Map<String, String> response = new HashMap<>();
            response.put("paymentMethodId", "pm_" + System.currentTimeMillis());
            response.put("status", "saved");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
