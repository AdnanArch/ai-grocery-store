package com.groceryapp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    @EqualsAndHashCode.Include
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("products")
    private Category category;

    private Instant createdAt;
    private Instant updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("product")
    @ToString.Exclude
    private Set<ProductImage> images;

    @OneToMany(mappedBy = "product")
    @JsonIgnore
    @ToString.Exclude
    private Set<OrderItem> orderItems;
}