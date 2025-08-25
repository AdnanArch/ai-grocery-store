package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.AIChat;
import com.groceryapp.backend.model.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    
    List<AIMessage> findByChatOrderByTimestampAsc(AIChat chat);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM AIMessage m WHERE m.chat = :chat")
    void deleteByChat(@Param("chat") AIChat chat);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM AIMessage m WHERE m.chat IN :chats")
    void deleteByChatIn(@Param("chats") List<AIChat> chats);
}
