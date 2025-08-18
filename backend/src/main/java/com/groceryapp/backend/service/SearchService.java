package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ProductRepository productRepository;

    public Page<Product> searchProducts(String query, Map<String, Object> filters, Pageable pageable) {
        try {
            Specification<Product> spec = buildSearchSpecification(query, filters);
            return productRepository.findAll(spec, pageable);
        } catch (Exception e) {
            log.error("Error searching products", e);
            return Page.empty(pageable);
        }
    }

    private Specification<Product> buildSearchSpecification(String query, Map<String, Object> filters) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Text search
            if (query != null && !query.trim().isEmpty()) {
                String searchQuery = "%" + query.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchQuery),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchQuery)
                ));
            }

            // Category filter
            if (filters.containsKey("categoryId") && filters.get("categoryId") != null) {
                Long categoryId = Long.valueOf(filters.get("categoryId").toString());
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            // Price range filter
            if (filters.containsKey("minPrice") && filters.get("minPrice") != null) {
                BigDecimal minPrice = new BigDecimal(filters.get("minPrice").toString());
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (filters.containsKey("maxPrice") && filters.get("maxPrice") != null) {
                BigDecimal maxPrice = new BigDecimal(filters.get("maxPrice").toString());
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Stock filter
            if (filters.containsKey("inStock") && Boolean.TRUE.equals(filters.get("inStock"))) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stock"), 0));
            }

            // Rating filter
            if (filters.containsKey("minRating") && filters.get("minRating") != null) {
                Double minRating = Double.valueOf(filters.get("minRating").toString());
                // This would need to be implemented with a join to reviews table
                // predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            // Brand filter
            if (filters.containsKey("brand") && filters.get("brand") != null) {
                String brand = filters.get("brand").toString();
                predicates.add(criteriaBuilder.equal(root.get("brand"), brand));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Map<String, Object> getSearchFacets(String query, Map<String, Object> filters) {
        try {
            // Get all products for facet calculation
            Specification<Product> spec = buildSearchSpecification(query, filters);
            List<Product> products = productRepository.findAll(spec);

            Map<String, Object> facets = Map.of(
                "categories", getCategoryFacets(products),
                "priceRanges", getPriceRangeFacets(products),
                "brands", getBrandFacets(products),
                "ratings", getRatingFacets(products)
            );

            return facets;
        } catch (Exception e) {
            log.error("Error getting search facets", e);
            return Map.of();
        }
    }

    private Map<String, Long> getCategoryFacets(List<Product> products) {
        return products.stream()
            .filter(p -> p.getCategory() != null)
            .collect(Collectors.groupingBy(
                p -> p.getCategory().getName(),
                Collectors.counting()
            ));
    }

    private Map<String, Long> getPriceRangeFacets(List<Product> products) {
        return products.stream()
            .collect(Collectors.groupingBy(
                p -> getPriceRange(p.getPrice()),
                Collectors.counting()
            ));
    }

    private String getPriceRange(BigDecimal price) {
        if (price.compareTo(new BigDecimal("10")) < 0) {
            return "Under $10";
        } else if (price.compareTo(new BigDecimal("25")) < 0) {
            return "$10 - $25";
        } else if (price.compareTo(new BigDecimal("50")) < 0) {
            return "$25 - $50";
        } else if (price.compareTo(new BigDecimal("100")) < 0) {
            return "$50 - $100";
        } else {
            return "Over $100";
        }
    }

    private Map<String, Long> getBrandFacets(List<Product> products) {
        // Since Product doesn't have a brand field, we'll use category as a proxy
        return products.stream()
            .filter(p -> p.getCategory() != null)
            .collect(Collectors.groupingBy(
                p -> p.getCategory().getName(),
                Collectors.counting()
            ));
    }

    private Map<String, Long> getRatingFacets(List<Product> products) {
        // This would need to be implemented with actual rating data
        return Map.of(
            "5 stars", 0L,
            "4+ stars", 0L,
            "3+ stars", 0L,
            "2+ stars", 0L,
            "1+ stars", 0L
        );
    }

    public List<String> getSearchSuggestions(String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return List.of();
            }

            String searchQuery = "%" + query.toLowerCase() + "%";
            
            // Get product names that match the query
            List<Product> products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query
            );

            return products.stream()
                .map(Product::getName)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting search suggestions", e);
            return List.of();
        }
    }

    public List<Product> getPopularSearches() {
        try {
            // This would typically be implemented with search analytics
            // For now, return products with highest stock (as a proxy for popularity)
            return productRepository.findTop10ByOrderByStockDesc();
        } catch (Exception e) {
            log.error("Error getting popular searches", e);
            return List.of();
        }
    }

    public Map<String, Object> getSearchAnalytics(String query) {
        try {
            Specification<Product> spec = buildSearchSpecification(query, Map.of());
            List<Product> products = productRepository.findAll(spec);

            return Map.of(
                "totalResults", products.size(),
                "query", query,
                "timestamp", System.currentTimeMillis(),
                "categories", getCategoryFacets(products),
                "priceRange", Map.of(
                    "min", products.stream().map(Product::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                    "max", products.stream().map(Product::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                    "avg", products.stream().map(Product::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(products.size()), 2, BigDecimal.ROUND_HALF_UP)
                )
            );
        } catch (Exception e) {
            log.error("Error getting search analytics", e);
            return Map.of();
        }
    }
}
