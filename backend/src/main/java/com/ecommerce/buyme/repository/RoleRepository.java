package com.ecommerce.buyme.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.buyme.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);

}
