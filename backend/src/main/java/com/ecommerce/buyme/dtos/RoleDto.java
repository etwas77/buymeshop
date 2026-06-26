package com.ecommerce.buyme.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleDto {
    @NotBlank
    private String name;
}
