package com.groceryapp.backend.repository;

import com.groceryapp.backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
