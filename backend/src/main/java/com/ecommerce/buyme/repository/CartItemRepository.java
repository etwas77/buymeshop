package com.ecommerce.buyme.repository;
import com.ecommerce.buyme.model.CartItem;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartItemRepository extends MongoRepository<CartItem, String> {

    List<CartItem> findByProductId(String productId);

    Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);

    void deleteAllByCartId(String cartId);
}
