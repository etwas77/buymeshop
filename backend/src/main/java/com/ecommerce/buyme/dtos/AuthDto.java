package com.ecommerce.buyme.dtos;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthDto {
    private String id;
    private Set<RoleDto> roles;
}
