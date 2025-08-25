package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.RecommendationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecommendationLogRepository extends JpaRepository<RecommendationLog, Long> {
    List<RecommendationLog> findByUserIdOrderByTimestampDesc(Long userId);
    void deleteByUserId(Long userId);
}