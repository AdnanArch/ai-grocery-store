package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.AdminActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    List<AdminActionLog> findByAdminId(Long adminId);
}
