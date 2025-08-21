package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.AIChat;
import com.groceryapp.backend.model.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    
    List<AIMessage> findByChatOrderByTimestampAsc(AIChat chat);
    
    void deleteByChat(AIChat chat);
    
    void deleteByChatIn(List<AIChat> chats);
}
