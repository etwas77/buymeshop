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
    private String id;
    private BigDecimal totalAmount;
    private String userId;
    private Set<CartItemDto> items;
}
