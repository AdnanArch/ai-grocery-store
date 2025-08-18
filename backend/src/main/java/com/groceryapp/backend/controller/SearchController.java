package com.groceryapp.backend.controller;

import com.groceryapp.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/products")
    public ResponseEntity<Page<?>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam Map<String, Object> filters) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<?> results = searchService.searchProducts(query, filters, pageable);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error searching products", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/facets")
    public ResponseEntity<Map<String, Object>> getSearchFacets(
            @RequestParam(required = false) String query,
            @RequestParam Map<String, Object> filters) {
        
        try {
            Map<String, Object> facets = searchService.getSearchFacets(query, filters);
            return ResponseEntity.ok(facets);
        } catch (Exception e) {
            log.error("Error getting search facets", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get search facets"));
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestParam String query) {
        try {
            List<String> suggestions = searchService.getSearchSuggestions(query);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error getting search suggestions", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<?>> getPopularSearches() {
        try {
            List<?> popularSearches = searchService.getPopularSearches();
            return ResponseEntity.ok(popularSearches);
        } catch (Exception e) {
            log.error("Error getting popular searches", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getSearchAnalytics(@RequestParam String query) {
        try {
            Map<String, Object> analytics = searchService.getSearchAnalytics(query);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting search analytics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get search analytics"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> searchHealthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "Search service is running",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}
