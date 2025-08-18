package com.groceryapp.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtUtil {

    @Value("${jwt.key}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "USER");
        return createToken(claims, username);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "USER");
        
        // Add user authorities to the token
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        claims.put("authorities", authorities);
        
        return createToken(claims, userDetails.getUsername());
    }

    // Overloaded method for backward compatibility
    public String generateToken(String username, List<String> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "USER");
        if (authorities != null && !authorities.isEmpty()) {
            claims.put("authorities", authorities);
        }
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plusMillis(jwtExpirationMs)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
