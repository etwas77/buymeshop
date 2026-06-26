package com.ecommerce.buyme.dtos;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private String id;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    
    private String productId;
    private String productName;
    private String productBrand;

    private List<ImageDto> images;
}
