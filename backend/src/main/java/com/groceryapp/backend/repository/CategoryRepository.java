package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentId(Long parentId);
}