package com.groceryapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    // This configuration is intentionally empty since this is a backend-only application
    // No static file serving is needed as the frontend is served separately
}
