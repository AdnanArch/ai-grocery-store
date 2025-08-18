package com.groceryapp.backend.controller;

import com.groceryapp.backend.model.Address;
import com.groceryapp.backend.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressRepository addrRepo;

    @GetMapping
    public List<Address> getAll() { return addrRepo.findAll(); }

    @GetMapping("/user/{userId}")
    public List<Address> getByUser(@PathVariable Long userId) {
        return addrRepo.findByUserId(userId);
    }

    @PostMapping
    public Address create(@RequestBody Address a) { return addrRepo.save(a); }

    @PutMapping("/{id}")
    public ResponseEntity<Address> update(@PathVariable Long id, @RequestBody Address a) {
        return addrRepo.findById(id).map(existing -> {
            a.setId(id);
            return ResponseEntity.ok(addrRepo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!addrRepo.existsById(id)) return ResponseEntity.notFound().build();
        addrRepo.deleteById(id); return ResponseEntity.noContent().build();
    }
}