package com.ecommerce.buyme.repository;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.OrderItem;

public interface OrderItemRepository extends MongoRepository<OrderItem, String> {

    List<OrderItem> findByProductId(String productId);

}
