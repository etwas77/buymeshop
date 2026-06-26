package com.ecommerce.buyme.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.Cart;

public interface CartRepository extends MongoRepository<Cart, String>  {

    Optional<Cart> findByUserId(String userId);

}
