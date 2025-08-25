package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    
    List<PaymentMethod> findByUserIdAndIsActiveTrue(Long userId);
    
    Optional<PaymentMethod> findByUserIdAndIsDefaultTrueAndIsActiveTrue(Long userId);
    
    Optional<PaymentMethod> findByStripePaymentMethodId(String stripePaymentMethodId);

    boolean existsByUserIdAndStripePaymentMethodId(Long userId, String stripePaymentMethodId);
    
    void deleteByUserId(Long userId);
}
