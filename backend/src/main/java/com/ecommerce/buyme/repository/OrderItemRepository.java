package com.ecommerce.buyme.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.buyme.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByProductId(Long productId);

}
