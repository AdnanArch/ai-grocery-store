package com.groceryapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    @EqualsAndHashCode.Include
    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;
}