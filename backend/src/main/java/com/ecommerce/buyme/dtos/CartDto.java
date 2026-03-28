package com.ecommerce.buyme.dtos;

import java.math.BigDecimal;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDto {
    private Long id;
    private BigDecimal totalAmount;
    private Long userId;
    private Set<CartItemDto> items;
}
