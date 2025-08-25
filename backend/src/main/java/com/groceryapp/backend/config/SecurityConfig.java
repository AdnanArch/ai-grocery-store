package com.groceryapp.backend.config;

import com.groceryapp.backend.security.JwtAuthenticationFilter;
import com.groceryapp.backend.service.JwtUtil;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${jwt.key}")
    private String jwtKey;

    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtUtil jwtUtil, JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtUtil = jwtUtil;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // API endpoints
                        .requestMatchers("/api/auth/**", "/api/products/**", "/api/categories/**", "/api/recommendations/**", "/api/images/**").permitAll()
                        // Static resources for React app
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/static/**",
                                "/manifest.json",
                                "/favicon.ico",
                                "/logo192.png",
                                "/logo512.png",
                                "/*.js",
                                "/*.css",
                                "/assets/**")
                        .permitAll()
                        // All other API requests require authentication
                        .requestMatchers("/api/**").authenticated()
                        // Allow React app to handle all other routes
                        .anyRequest().permitAll())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:8080", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @PostConstruct
    public void checkJwtKey() {
        if (jwtKey == null || jwtKey.isEmpty()) {
            System.err.println("JWT key is missing or empty!");
        } else {
            System.out.println("JWT key loaded, length: " + jwtKey.length());
        }
    }
}