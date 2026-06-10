package com.ecommerce.buyme.model;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {
    @Id
    private String id;
    
    private int quantity;
    private BigDecimal price;

    private Order order;

    private Product product;

    public OrderItem(Order order, Product product, BigDecimal price, int quantity) {
        this.quantity = quantity;
        this.price = price;
        this.order = order;
        this.product = product;
    }
}
