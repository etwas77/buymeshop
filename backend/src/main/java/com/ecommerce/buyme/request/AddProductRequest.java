package com.ecommerce.buyme.request;

import java.math.BigDecimal;

import com.ecommerce.buyme.model.Category;

import lombok.Data;

@Data
public class AddProductRequest {
    private Long id;

    private String name;
    private String brand;
    private BigDecimal price;
    private int inventory;
    private String description;

    private Category category;
}
