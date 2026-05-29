package com.ecommerce.buyme.dtos;

import java.util.List;
import java.util.Set;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;

    private String email;
    //private String password;

    private CartDto cart;

    private Set<OrderDto> orders;

    private List<AddressDto> addresses;
}
