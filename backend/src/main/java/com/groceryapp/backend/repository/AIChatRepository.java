package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.AIChat;
import com.groceryapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIChatRepository extends JpaRepository<AIChat, Long> {
    
    List<AIChat> findByUserOrderByUpdatedAtDesc(User user);
    
    Optional<AIChat> findByIdAndUser(Long id, User user);
    
    void deleteByUser(User user);
}
