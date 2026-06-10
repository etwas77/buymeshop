package com.ecommerce.buyme.request;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.model.Category;

import lombok.Data;

@Data
public class ProductUpdateRequest {
    private String id;

    private String name;
    private String brand;
    private BigDecimal price;
    private int inventory;
    private String description;

    private Category category;
    private List<ImageDto> images;
}
