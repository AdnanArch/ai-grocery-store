package com.groceryapp.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemId implements java.io.Serializable {
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "product_id")
    private Long productId;
}