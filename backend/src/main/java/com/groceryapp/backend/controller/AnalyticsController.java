package com.groceryapp.backend.controller;

import com.groceryapp.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = analyticsService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting dashboard stats", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get dashboard stats"));
        }
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSalesAnalytics(@RequestParam(defaultValue = "month") String period) {
        try {
            Map<String, Object> analytics = analyticsService.getSalesAnalytics(period);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting sales analytics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get sales analytics"));
        }
    }

    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getProductAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getProductAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting product analytics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get product analytics"));
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getUserAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting user analytics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get user analytics"));
        }
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getRevenueAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting revenue analytics", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get revenue analytics"));
        }
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> exportAnalyticsReport() {
        try {
            Map<String, Object> report = analyticsService.exportAnalyticsReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error exporting analytics report", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to export analytics report"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> analyticsHealthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "Analytics service is running",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}
