package com.groceryapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;
    
    @Column(nullable = false)
    private String type; // CARD, BANK_ACCOUNT, etc.
    
    @Column(nullable = false)
    private String last4; // Last 4 digits of card/account
    
    @Column(nullable = false)
    private String brand; // VISA, MASTERCARD, etc.
    
    @Column(nullable = false)
    private String jazzCashAccountId; // JazzCash account ID
    
    @Column(nullable = false)
    private Boolean isDefault = false;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "expiry_month")
    private Integer expiryMonth;
    
    @Column(name = "expiry_year")
    private Integer expiryYear;
    
    @Column(name = "card_holder_name")
    private String cardHolderName;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
