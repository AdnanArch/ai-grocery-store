package com.groceryapp.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private OrderItemId id;

    @MapsId("orderId")
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Order order;

    @MapsId("productId")
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private BigDecimal price;
}