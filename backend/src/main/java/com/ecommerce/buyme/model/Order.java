package com.ecommerce.buyme.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.ecommerce.buyme.enums.OrderStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {
    @Id
    private String id;
    
    private LocalDate orderDate;
    private BigDecimal totalAmount;

    private OrderStatus status;

    private User user;

    private Set<OrderItem> orderItems = new HashSet<>();
}
