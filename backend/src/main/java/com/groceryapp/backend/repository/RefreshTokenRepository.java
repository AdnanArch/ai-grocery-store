package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.RefreshToken;
import com.groceryapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);
}