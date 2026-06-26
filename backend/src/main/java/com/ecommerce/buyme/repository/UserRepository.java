package com.ecommerce.buyme.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    boolean existsByEmail(String email);

    User findByEmail(String email);
}
