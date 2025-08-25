package com.groceryapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    private static final String UPLOAD_DIR = "uploads/products/";

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    // No resource handler needed - using controller endpoint instead
    // @Override
    // public void addResourceHandlers(ResourceHandlerRegistry registry) {
    //     registry.addResourceHandler("/api/admin/images/**")
    //             .addResourceLocations("file:" + UPLOAD_DIR);
    // }
}
