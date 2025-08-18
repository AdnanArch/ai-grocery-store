// src/main/java/com/groceryapp/backend/service/CustomUserDetailsService.java
package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Role;
import com.groceryapp.backend.model.User;
import com.groceryapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email: " + email));

        // convert your Role entities into GrantedAuthority
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(Role::getName)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getHashedPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.getActive()) // Disable account if user is not active
                .build();
    }
}
