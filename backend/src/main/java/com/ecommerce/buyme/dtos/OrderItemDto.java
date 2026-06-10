package com.ecommerce.buyme.dtos;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {
    private String id;
    private String productId;
    private String productName;
    private String productBrand;
    private int quantity;
    private BigDecimal price;
}
