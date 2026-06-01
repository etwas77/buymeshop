package com.ecommerce.buyme.request;

import java.util.Set;

import com.ecommerce.buyme.dtos.RoleDto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Set<RoleDto> roles; // Assuming roles are represented as a set of role names (e.g., "ROLE_USER", "ADMIN")
}
