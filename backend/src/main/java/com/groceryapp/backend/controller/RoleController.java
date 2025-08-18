package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Role;
import com.groceryapp.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleRepository roleRepo;

    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRole(@PathVariable Long id) {
        return roleRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleRepo.save(role);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleRepo.findById(id).map(r -> {
            role.setId(id);
            return ResponseEntity.ok(roleRepo.save(role));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepo.existsById(id)) return ResponseEntity.notFound().build();
        roleRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}