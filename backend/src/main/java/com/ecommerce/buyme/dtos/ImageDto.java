package com.ecommerce.buyme.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageDto {
    private String id;
    private String fileName;
    private String downloadUrl;
}
