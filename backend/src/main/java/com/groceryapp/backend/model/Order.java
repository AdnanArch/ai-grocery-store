package com.groceryapp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    @Column(nullable = false)
    private BigDecimal totalAmount;
    @Column(nullable = false)
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("order")
    @ToString.Exclude
    private Set<OrderItem> items;
}
