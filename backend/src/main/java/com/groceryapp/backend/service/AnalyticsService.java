package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.OrderRepository;
import com.groceryapp.backend.repository.ProductRepository;
import com.groceryapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Basic counts
            stats.put("totalUsers", userRepository.count());
            stats.put("totalProducts", productRepository.count());
            stats.put("totalOrders", orderRepository.count());
            
            // Revenue calculations
            List<Order> allOrders = orderRepository.findAll();
            BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.put("totalRevenue", totalRevenue);
            
            // Average order value
            if (!allOrders.isEmpty()) {
                BigDecimal avgOrderValue = totalRevenue.divide(BigDecimal.valueOf(allOrders.size()), 2, BigDecimal.ROUND_HALF_UP);
                stats.put("averageOrderValue", avgOrderValue);
            }
            
            // Order status breakdown
            Map<String, Long> orderStatusCounts = allOrders.stream()
                .collect(Collectors.groupingBy(
                    Order::getStatus,
                    Collectors.counting()
                ));
            stats.put("orderStatusBreakdown", orderStatusCounts);
            
            // Low stock products
            List<Product> lowStockProducts = productRepository.findByStockLessThan(10);
            stats.put("lowStockProducts", lowStockProducts.size());
            
            return stats;
        } catch (Exception e) {
            log.error("Error getting dashboard stats", e);
            return Map.of();
        }
    }

    public Map<String, Object> getSalesAnalytics(String period) {
        try {
            LocalDateTime startDate = getStartDate(period);
            LocalDateTime endDate = LocalDateTime.now();
            
            List<Order> orders = orderRepository.findAll().stream()
                .filter(order -> {
                    if (order.getCreatedAt() == null) return false;
                    LocalDateTime orderDate = order.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime();
                    return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
                })
                .collect(Collectors.toList());
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Sales by day
            Map<String, BigDecimal> salesByDay = orders.stream()
                .collect(Collectors.groupingBy(
                    order -> order.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    Collectors.mapping(
                        Order::getTotalAmount,
                        Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                    )
                ));
            analytics.put("salesByDay", salesByDay);
            
            // Total sales for period
            BigDecimal totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            analytics.put("totalSales", totalSales);
            
            // Order count for period
            analytics.put("orderCount", orders.size());
            
            // Average order value for period
            if (!orders.isEmpty()) {
                BigDecimal avgOrderValue = totalSales.divide(BigDecimal.valueOf(orders.size()), 2, BigDecimal.ROUND_HALF_UP);
                analytics.put("averageOrderValue", avgOrderValue);
            }
            
            return analytics;
        } catch (Exception e) {
            log.error("Error getting sales analytics", e);
            return Map.of();
        }
    }

    public Map<String, Object> getProductAnalytics() {
        try {
            List<Product> products = productRepository.findAll();
            List<Order> orders = orderRepository.findAll();
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Top selling products (based on order items)
            Map<Long, Integer> productSales = new HashMap<>();
            for (Order order : orders) {
                if (order.getItems() != null) {
                    for (var item : order.getItems()) {
                        Long productId = item.getProduct().getId();
                        productSales.merge(productId, item.getQuantity(), Integer::sum);
                    }
                }
            }
            
            // Sort by sales quantity
            List<Map.Entry<Long, Integer>> topSelling = productSales.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> topProducts = new ArrayList<>();
            for (Map.Entry<Long, Integer> entry : topSelling) {
                Product product = productRepository.findById(entry.getKey()).orElse(null);
                if (product != null) {
                    Map<String, Object> productData = new HashMap<>();
                    productData.put("id", product.getId());
                    productData.put("name", product.getName());
                    productData.put("salesQuantity", entry.getValue());
                    productData.put("price", product.getPrice());
                    productData.put("stock", product.getStock());
                    topProducts.add(productData);
                }
            }
            analytics.put("topSellingProducts", topProducts);
            
            // Low stock products
            List<Product> lowStockProducts = productRepository.findByStockLessThan(10);
            List<Map<String, Object>> lowStockData = lowStockProducts.stream()
                .map(product -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", product.getId());
                    data.put("name", product.getName());
                    data.put("stock", product.getStock());
                    data.put("price", product.getPrice());
                    return data;
                })
                .collect(Collectors.toList());
            analytics.put("lowStockProducts", lowStockData);
            
            // Category distribution
            Map<String, Long> categoryDistribution = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(
                    p -> p.getCategory().getName(),
                    Collectors.counting()
                ));
            analytics.put("categoryDistribution", categoryDistribution);
            
            return analytics;
        } catch (Exception e) {
            log.error("Error getting product analytics", e);
            return Map.of();
        }
    }

    public Map<String, Object> getUserAnalytics() {
        try {
            List<User> users = userRepository.findAll();
            List<Order> orders = orderRepository.findAll();
            
            Map<String, Object> analytics = new HashMap<>();
            
            // User growth over time
            Map<String, Long> userGrowth = users.stream()
                .filter(user -> user.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    user -> user.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.counting()
                ));
            analytics.put("userGrowth", userGrowth);
            
            // Top customers by order value
            Map<Long, BigDecimal> customerSpending = new HashMap<>();
            for (Order order : orders) {
                Long userId = order.getUser().getId();
                customerSpending.merge(userId, order.getTotalAmount(), BigDecimal::add);
            }
            
            List<Map.Entry<Long, BigDecimal>> topCustomers = customerSpending.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> topCustomersData = new ArrayList<>();
            for (Map.Entry<Long, BigDecimal> entry : topCustomers) {
                User user = userRepository.findById(entry.getKey()).orElse(null);
                if (user != null) {
                    Map<String, Object> customerData = new HashMap<>();
                    customerData.put("id", user.getId());
                    customerData.put("name", user.getFirstName() + " " + user.getLastName());
                    customerData.put("email", user.getEmail());
                    customerData.put("totalSpent", entry.getValue());
                    topCustomersData.add(customerData);
                }
            }
            analytics.put("topCustomers", topCustomersData);
            
            // User activity (users with orders)
            long activeUsers = orders.stream()
                .map(order -> order.getUser().getId())
                .distinct()
                .count();
            analytics.put("activeUsers", activeUsers);
            analytics.put("totalUsers", users.size());
            analytics.put("userActivityRate", users.size() > 0 ? (double) activeUsers / users.size() : 0.0);
            
            return analytics;
        } catch (Exception e) {
            log.error("Error getting user analytics", e);
            return Map.of();
        }
    }

    public Map<String, Object> getRevenueAnalytics() {
        try {
            List<Order> orders = orderRepository.findAll();
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Revenue by month
            Map<String, BigDecimal> revenueByMonth = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    order -> order.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.mapping(
                        Order::getTotalAmount,
                        Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                    )
                ));
            analytics.put("revenueByMonth", revenueByMonth);
            
            // Revenue growth
            List<BigDecimal> monthlyRevenue = revenueByMonth.values().stream()
                .sorted()
                .collect(Collectors.toList());
            
            if (monthlyRevenue.size() >= 2) {
                BigDecimal currentMonth = monthlyRevenue.get(monthlyRevenue.size() - 1);
                BigDecimal previousMonth = monthlyRevenue.get(monthlyRevenue.size() - 2);
                BigDecimal growthRate = previousMonth.compareTo(BigDecimal.ZERO) > 0 
                    ? currentMonth.subtract(previousMonth).divide(previousMonth, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;
                analytics.put("revenueGrowthRate", growthRate);
            }
            
            // Average order value trend
            Map<String, Double> avgOrderValueByMonth = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    order -> order.getCreatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.averagingDouble(order -> order.getTotalAmount().doubleValue())
                ));
            analytics.put("averageOrderValueByMonth", avgOrderValueByMonth);
            
            return analytics;
        } catch (Exception e) {
            log.error("Error getting revenue analytics", e);
            return Map.of();
        }
    }

    private LocalDateTime getStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toLowerCase()) {
            case "week" -> now.minusWeeks(1);
            case "month" -> now.minusMonths(1);
            case "quarter" -> now.minusMonths(3);
            case "year" -> now.minusYears(1);
            default -> now.minusDays(30); // Default to 30 days
        };
    }

    public Map<String, Object> exportAnalyticsReport() {
        try {
            Map<String, Object> report = new HashMap<>();
            report.put("generatedAt", LocalDateTime.now().toString());
            report.put("dashboardStats", getDashboardStats());
            report.put("salesAnalytics", getSalesAnalytics("month"));
            report.put("productAnalytics", getProductAnalytics());
            report.put("userAnalytics", getUserAnalytics());
            report.put("revenueAnalytics", getRevenueAnalytics());
            
            return report;
        } catch (Exception e) {
            log.error("Error generating analytics report", e);
            return Map.of("error", "Failed to generate report");
        }
    }
}
