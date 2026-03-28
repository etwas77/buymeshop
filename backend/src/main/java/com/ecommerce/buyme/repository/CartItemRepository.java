package com.ecommerce.buyme.repository;
import com.ecommerce.buyme.model.CartItem;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByProductId(Long productId);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    void deleteAllByCartId(Long cartId);
}
