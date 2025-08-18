package com.groceryapp.backend.security;

import com.groceryapp.backend.service.CustomUserDetailsService;
import com.groceryapp.backend.service.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Authorization header or not Bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        log.debug("Processing JWT token: {}", jwt.substring(0, Math.min(jwt.length(), 50)) + "...");
        
        try {
            userEmail = jwtUtil.extractUsername(jwt);
            log.debug("Extracted username from token: {}", userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.debug("Loaded user details for: {}", userEmail);
                log.debug("User authorities: {}", userDetails.getAuthorities().toString());

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    log.debug("Token is valid, extracting authorities");
                    // Extract authorities from JWT token if available
                    List<SimpleGrantedAuthority> authorities = extractAuthoritiesFromToken(jwt);
                    log.debug("Authorities from token: {}", authorities.toString());
                    
                    // If no authorities in token, use the ones from UserDetails
                    if (authorities.isEmpty()) {
                        authorities = userDetails.getAuthorities().stream()
                                .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                                .collect(Collectors.toList());
                        log.debug("Using authorities from UserDetails: {}", authorities.toString());
                    }
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Set authentication in SecurityContext for user: {}", userEmail);
                } else {
                    log.debug("Token validation failed for user: {}", userEmail);
                }
            } else {
                log.debug("User email is null or authentication already exists");
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }
    
    private List<SimpleGrantedAuthority> extractAuthoritiesFromToken(String token) {
        try {
            Claims claims = jwtUtil.extractAllClaims(token);
            @SuppressWarnings("unchecked")
            List<String> authorities = (List<String>) claims.get("authorities");
            
            if (authorities != null) {
                return authorities.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("Could not extract authorities from token", e);
        }
        return List.of();
    }
}
