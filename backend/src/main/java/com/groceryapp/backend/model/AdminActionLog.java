package com.groceryapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "admin_action_logs")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    @ToString.Exclude
    private User admin;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entity;

    private Long entityId;
    private Instant timestamp;
    private String details;
}

