package com.ecommerce.buyme.dtos;

import com.ecommerce.buyme.enums.AddressType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {
    private String id;

    private String country;
    private String city;
    private String street;
    private String phone;

    private AddressType addressType;

    private String userId;
    private String optionalName;
}
