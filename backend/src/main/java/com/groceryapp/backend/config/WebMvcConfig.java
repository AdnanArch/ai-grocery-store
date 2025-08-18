package com.groceryapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This will serve static resources from the frontend/build directory
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // If the requested resource exists, return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // If the resource doesn't exist, return index.html for client-side routing
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
