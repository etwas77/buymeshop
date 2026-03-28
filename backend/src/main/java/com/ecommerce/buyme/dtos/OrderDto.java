package com.ecommerce.buyme.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import com.ecommerce.buyme.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {
    private Long id;

    private LocalDate orderDate;

    private BigDecimal totalAmount;

    private OrderStatus status;

    private Long userId;

    private Set<OrderItemDto> orderItems;
}
