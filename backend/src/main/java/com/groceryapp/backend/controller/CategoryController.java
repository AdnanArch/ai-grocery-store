package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Category;
import com.groceryapp.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Remove duplicates based on name (in case there are any)
        List<Category> uniqueCategories = categories.stream()
            .collect(java.util.stream.Collectors.toMap(
                Category::getName,
                category -> category,
                (existing, replacement) -> existing
            ))
            .values()
            .stream()
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(uniqueCategories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }
    
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Category>> getCategoriesByParent(@PathVariable Long parentId) {
        List<Category> categories = categoryRepository.findByParentId(parentId);
        return ResponseEntity.ok(categories);
    }
}
