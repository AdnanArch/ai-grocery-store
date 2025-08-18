package com.groceryapp.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(nullable = false)
    private String street;
    @Column(nullable = false)
    private String city;
    private String state;
    private String postalCode;
    @Column(nullable = false)
    private String country;
    @Column(nullable = false)
    private boolean isDefault;
}