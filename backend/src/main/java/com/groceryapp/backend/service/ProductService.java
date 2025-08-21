package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Product;
import com.groceryapp.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(Pageable pageable) {
        // Load all products with their images and categories
        List<Product> productsWithImages = productRepository.findAllWithCategoryAndImages();
        
        // Apply pagination manually since we're using a custom query
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), productsWithImages.size());
        
        if (start > productsWithImages.size()) {
            return Page.empty(pageable);
        }
        
        List<Product> pageContent = productsWithImages.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, productsWithImages.size());
    }

    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        // Load all products with images and filter by category
        List<Product> allProducts = productRepository.findAllWithCategoryAndImages();
        List<Product> filteredProducts = allProducts.stream()
            .filter(product -> product.getCategory() != null && product.getCategory().getId().equals(categoryId))
            .toList();
        
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredProducts.size());
        
        if (start > filteredProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<Product> pageContent = filteredProducts.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filteredProducts.size());
    }

    public Page<Product> searchProductsByName(String searchTerm, Pageable pageable) {
        // Load all products with images and filter by name
        List<Product> allProducts = productRepository.findAllWithCategoryAndImages();
        List<Product> filteredProducts = allProducts.stream()
            .filter(product -> product.getName().toLowerCase().contains(searchTerm.toLowerCase()))
            .toList();
        
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredProducts.size());
        
        if (start > filteredProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<Product> pageContent = filteredProducts.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filteredProducts.size());
    }

    public Page<Product> searchProductsByNameAndCategory(String searchTerm, Long categoryId, Pageable pageable) {
        // Load all products with images and filter by name and category
        List<Product> allProducts = productRepository.findAllWithCategoryAndImages();
        List<Product> filteredProducts = allProducts.stream()
            .filter(product -> product.getName().toLowerCase().contains(searchTerm.toLowerCase()) &&
                             product.getCategory() != null && product.getCategory().getId().equals(categoryId))
            .toList();
        
        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredProducts.size());
        
        if (start > filteredProducts.size()) {
            return Page.empty(pageable);
        }
        
        List<Product> pageContent = filteredProducts.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filteredProducts.size());
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findByIdWithCategoryAndImages(id);
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
