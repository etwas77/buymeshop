package com.ecommerce.buyme.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.buyme.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    User findByEmail(String email);
}
