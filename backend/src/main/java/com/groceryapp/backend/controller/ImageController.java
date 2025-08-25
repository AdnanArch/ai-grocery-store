package com.groceryapp.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
@Slf4j
public class ImageController {

    private static final String UPLOAD_DIR = "uploads/products/";

    // Serve uploaded images publicly
    @GetMapping("/products/{filename}")
    public ResponseEntity<?> serveProductImage(@PathVariable String filename) {
        log.info("Attempting to serve image: {}", filename);
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            log.info("Looking for image at path: {}", filePath.toAbsolutePath());
            
            if (!Files.exists(filePath)) {
                log.warn("Image file not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            log.info("Image file found, reading bytes...");
            byte[] imageBytes = Files.readAllBytes(filePath);
            String contentType = determineContentType(filename);
            log.info("Serving image: {} ({} bytes, content-type: {})", filename, imageBytes.length, contentType);

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(imageBytes);

        } catch (IOException e) {
            log.error("Error serving image: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        switch (extension) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".webp":
                return "image/webp";
            default:
                return "image/jpeg";
        }
    }
}
