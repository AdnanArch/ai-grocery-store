package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    public Page<Product> searchProductsByName(String searchTerm, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
    }

    public Page<Product> searchProductsByNameAndCategory(String searchTerm, Long categoryId, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndCategoryId(searchTerm, categoryId, pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public Product createProduct(Product product) {
        Instant now = Instant.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        
        // Save the product first
        Product savedProduct = productRepository.save(product);
        
        // Handle images if present
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            for (var image : product.getImages()) {
                image.setProduct(savedProduct);
            }
        }
        
        return savedProduct;
    }

    @Transactional
    public Optional<Product> updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    existingProduct.setName(productDetails.getName());
                    existingProduct.setDescription(productDetails.getDescription());
                    existingProduct.setPrice(productDetails.getPrice());
                    existingProduct.setStock(productDetails.getStock());
                    existingProduct.setCategory(productDetails.getCategory());
                    existingProduct.setUpdatedAt(Instant.now());
                    // Don't update createdAt
                    // Don't replace images directly, handle that separately if needed
                    return productRepository.save(existingProduct);
                });
    }

    @Transactional
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
