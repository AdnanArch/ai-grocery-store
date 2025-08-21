package com.groceryapp.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import com.stripe.net.Webhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.currency}")
    private String currency;
    
    @Value("${stripe.enable-pkr:true}")
    private boolean enablePkr;
    
    @Value("${stripe.fallback-currency:usd}")
    private String fallbackCurrency;
    
    @Value("${stripe.exchange-rate-pkr-to-usd:280}")
    private BigDecimal exchangeRatePkrToUsd;

    public StripeService(@Value("${stripe.secret-key}") String stripeSecretKey) {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Create a PaymentIntent for processing payments
     */
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String customerEmail, String description) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(convertToStripeAmount(amount))
                    .setCurrency(currency != null ? currency : this.currency)
                    .setDescription(description)
                    .setReceiptEmail(customerEmail)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Created PaymentIntent: {}", paymentIntent.getId());
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Error creating PaymentIntent: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    /**
     * Confirm a PaymentIntent
     */
    public PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId) {
        try {
            PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod(paymentMethodId)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            paymentIntent = paymentIntent.confirm(params);
            log.info("Confirmed PaymentIntent: {}", paymentIntentId);
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Error confirming PaymentIntent: {}", e.getMessage());
            throw new RuntimeException("Failed to confirm payment intent", e);
        }
    }

    /**
     * Retrieve a PaymentIntent
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            log.info("Retrieved PaymentIntent: {}", paymentIntentId);
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Error retrieving PaymentIntent: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve payment intent", e);
        }
    }

    /**
     * Create a Customer
     */
    public Customer createCustomer(String email, String name, String phone) {
        try {
            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(email)
                    .setName(name)
                    .setPhone(phone)
                    .build();

            Customer customer = Customer.create(params);
            log.info("Created Customer: {}", customer.getId());
            return customer;
        } catch (StripeException e) {
            log.error("Error creating Customer: {}", e.getMessage());
            throw new RuntimeException("Failed to create customer", e);
        }
    }

    /**
     * Attach a PaymentMethod to a Customer
     */
    public PaymentMethod attachPaymentMethodToCustomer(String paymentMethodId, String customerId) {
        try {
            PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                    .setCustomer(customerId)
                    .build();

            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            paymentMethod = paymentMethod.attach(params);
            log.info("Attached PaymentMethod {} to Customer {}", paymentMethodId, customerId);
            return paymentMethod;
        } catch (StripeException e) {
            log.error("Error attaching PaymentMethod: {}", e.getMessage());
            throw new RuntimeException("Failed to attach payment method", e);
        }
    }

    /**
     * Create a SetupIntent for saving payment methods
     */
    public SetupIntent createSetupIntent(String customerId) {
        try {
            SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                    .setCustomer(customerId)
                    .addPaymentMethodType("card")
                    .addPaymentMethodType("sepa_debit")
                    .addPaymentMethodType("sofort")
                    .build();

            SetupIntent setupIntent = SetupIntent.create(params);
            log.info("Created SetupIntent: {}", setupIntent.getId());
            return setupIntent;
        } catch (StripeException e) {
            log.error("Error creating SetupIntent: {}", e.getMessage());
            throw new RuntimeException("Failed to create setup intent", e);
        }
    }

    /**
     * Retrieve a Customer's saved PaymentMethods
     */
    public java.util.List<PaymentMethod> getCustomerPaymentMethods(String customerId) {
        try {
            PaymentMethodListParams params = PaymentMethodListParams.builder()
                    .setCustomer(customerId)
                    .setType(PaymentMethodListParams.Type.CARD)
                    .build();

            PaymentMethodCollection paymentMethods = PaymentMethod.list(params);
            log.info("Retrieved {} PaymentMethods for Customer {}", paymentMethods.getData().size(), customerId);
            return paymentMethods.getData();
        } catch (StripeException e) {
            log.error("Error retrieving PaymentMethods: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve payment methods", e);
        }
    }

    /**
     * Create a Refund
     */
    public Refund createRefund(String paymentIntentId, BigDecimal amount, String reason) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(convertToStripeAmount(amount))
                    .setReason(RefundCreateParams.Reason.valueOf(reason.toUpperCase()))
                    .build();

            Refund refund = Refund.create(params);
            log.info("Created Refund: {} for PaymentIntent: {}", refund.getId(), paymentIntentId);
            return refund;
        } catch (StripeException e) {
            log.error("Error creating Refund: {}", e.getMessage());
            throw new RuntimeException("Failed to create refund", e);
        }
    }

    /**
     * Verify webhook signature
     */
    public Event constructWebhookEvent(String payload, String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Verified webhook event: {}", event.getType());
            return event;
        } catch (Exception e) {
            log.error("Error verifying webhook signature: {}", e.getMessage());
            throw new RuntimeException("Failed to verify webhook signature", e);
        }
    }

    /**
     * Convert BigDecimal amount to Stripe amount (smallest currency unit)
     */
    private Long convertToStripeAmount(BigDecimal amount) {
        // For PKR, Stripe expects amount in paisa (1/100th of rupee)
        // For USD, Stripe expects amount in cents (1/100th of dollar)
        return amount.multiply(BigDecimal.valueOf(100)).longValue();
    }

    /**
     * Convert Stripe amount (cents) to BigDecimal
     */
    public BigDecimal convertFromStripeAmount(Long amount) {
        return BigDecimal.valueOf(amount).divide(BigDecimal.valueOf(100));
    }

    /**
     * Get payment method details
     */
    public PaymentMethod getPaymentMethod(String paymentMethodId) {
        try {
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            log.info("Retrieved PaymentMethod: {}", paymentMethodId);
            return paymentMethod;
        } catch (StripeException e) {
            log.error("Error retrieving PaymentMethod: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve payment method", e);
        }
    }

    /**
     * Detach a PaymentMethod
     */
    public PaymentMethod detachPaymentMethod(String paymentMethodId) {
        try {
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            paymentMethod = paymentMethod.detach();
            log.info("Detached PaymentMethod: {}", paymentMethodId);
            return paymentMethod;
        } catch (StripeException e) {
            log.error("Error detaching PaymentMethod: {}", e.getMessage());
            throw new RuntimeException("Failed to detach payment method", e);
        }
    }

    /**
     * Create a Checkout Session for redirect
     */
    public com.stripe.model.checkout.Session createCheckoutSession(Long orderId, BigDecimal amount, String currency, String customerEmail, String successUrl, String cancelUrl) {
        try {
            // Check if PKR is supported, if not fallback to USD
            String finalCurrency = currency;
            BigDecimal finalAmount = amount;
            
            if ("pkr".equalsIgnoreCase(currency) && enablePkr) {
                try {
                    // Try to create a test session with PKR to check if supported
                    com.stripe.param.checkout.SessionCreateParams testParams = com.stripe.param.checkout.SessionCreateParams.builder()
                            .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl(successUrl)
                            .setCancelUrl(cancelUrl)
                            .setCustomerEmail(customerEmail)
                            .addLineItem(
                                    com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                                            .setPriceData(
                                                    com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                                            .setCurrency("pkr")
                                                            .setProductData(
                                                                    com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                            .setName("Test")
                                                                            .build()
                                                            )
                                                            .setUnitAmount(100L) // 1 PKR
                                                            .build()
                                            )
                                            .setQuantity(1L)
                                            .build()
                            )
                            .build();
                    
                    com.stripe.model.checkout.Session.create(testParams);
                    log.info("PKR currency is supported by Stripe account");
                } catch (StripeException e) {
                    if (e.getMessage().contains("currency") || e.getMessage().contains("pkr")) {
                        log.warn("PKR currency not supported by Stripe account, falling back to {}", fallbackCurrency);
                        finalCurrency = fallbackCurrency;
                        // Convert PKR to fallback currency using configured exchange rate
                        finalAmount = amount.divide(exchangeRatePkrToUsd, 2, BigDecimal.ROUND_HALF_UP);
                    } else {
                        throw e;
                    }
                }
            } else if ("pkr".equalsIgnoreCase(currency) && !enablePkr) {
                log.info("PKR disabled in configuration, using fallback currency: {}", fallbackCurrency);
                finalCurrency = fallbackCurrency;
                finalAmount = amount.divide(exchangeRatePkrToUsd, 2, BigDecimal.ROUND_HALF_UP);
            }
            
            com.stripe.param.checkout.SessionCreateParams params = com.stripe.param.checkout.SessionCreateParams.builder()
                    .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .setCustomerEmail(customerEmail)
                    .addLineItem(
                            com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency(finalCurrency)
                                                    .setProductData(
                                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Order #" + orderId + (finalCurrency.equals("usd") ? " (PKR: ₨" + amount + ")" : ""))
                                                                    .build()
                                                    )
                                                    .setUnitAmount(convertToStripeAmount(finalAmount))
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .putMetadata("orderId", orderId.toString())
                    .putMetadata("originalCurrency", currency)
                    .putMetadata("originalAmount", amount.toString())
                    .putMetadata("convertedCurrency", finalCurrency)
                    .putMetadata("convertedAmount", finalAmount.toString())
                    .build();

            com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.create(params);
            log.info("Created Checkout Session: {} for Order: {} with currency: {}", session.getId(), orderId, finalCurrency);
            return session;
        } catch (StripeException e) {
            log.error("Error creating Checkout Session: {}", e.getMessage());
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
        }
    }
}
