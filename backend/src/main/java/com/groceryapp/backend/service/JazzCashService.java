package com.groceryapp.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class JazzCashService {

    @Value("${jazzcash.merchant-id}")
    private String merchantId;

    @Value("${jazzcash.password}")
    private String password;

    @Value("${jazzcash.return-url}")
    private String returnUrl;

    @Value("${jazzcash.currency}")
    private String currency;

    @Value("${jazzcash.language}")
    private String language;

    @Value("${jazzcash.api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> createPaymentRequest(Long orderId, BigDecimal amount, String customerEmail, String customerPhone) {
        try {
            String txnDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String txnRefNumber = "TXN" + System.currentTimeMillis();
            
            // Create the request payload for JazzCash
            Map<String, String> requestData = new HashMap<>();
            requestData.put("pp_MerchantID", merchantId);
            requestData.put("pp_Password", password);
            requestData.put("pp_ReturnURL", returnUrl);
            requestData.put("pp_Amount", amount.multiply(new BigDecimal("100")).intValue() + ""); // Convert to smallest currency unit
            requestData.put("pp_TxnCurrency", currency);
            requestData.put("pp_TxnDateTime", txnDateTime);
            requestData.put("pp_TxnRefNumber", txnRefNumber);
            requestData.put("pp_Version", "1.1");
            requestData.put("pp_TxnType", "MWALLET");
            requestData.put("pp_Language", language);
            requestData.put("pp_ProductID", "RETL");
            requestData.put("pp_TxnExpiryDateTime", LocalDateTime.now().plusHours(1).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
            requestData.put("pp_CNIC", "");
            requestData.put("pp_MobileNumber", customerPhone);
            requestData.put("pp_EmailAddress", customerEmail);
            requestData.put("pp_BillReference", "billRef");
            requestData.put("pp_Description", "Payment for Order #" + orderId);

            // For now, return a mock response
            // In production, you would make an actual API call to JazzCash
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("txnRefNumber", txnRefNumber);
            response.put("redirectUrl", "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction");
            response.put("requestData", requestData);
            
            log.info("JazzCash payment request created for order: {}", orderId);
            return response;

        } catch (Exception e) {
            log.error("Error creating JazzCash payment request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }

    public Map<String, Object> verifyPayment(String txnRefNumber, String responseCode) {
        try {
            // In production, you would verify the payment with JazzCash
            // For now, we'll simulate a successful verification
            Map<String, Object> response = new HashMap<>();
            
            if ("000".equals(responseCode) || "121".equals(responseCode) || "200".equals(responseCode)) {
                response.put("success", true);
                response.put("status", "COMPLETED");
                response.put("message", "Payment completed successfully");
            } else {
                response.put("success", false);
                response.put("status", "FAILED");
                response.put("message", "Payment failed");
            }
            
            log.info("JazzCash payment verification for txnRef: {}, responseCode: {}", txnRefNumber, responseCode);
            return response;

        } catch (Exception e) {
            log.error("Error verifying JazzCash payment: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }
}
