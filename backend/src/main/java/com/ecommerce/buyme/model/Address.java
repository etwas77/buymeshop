package com.ecommerce.buyme.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.ecommerce.buyme.enums.AddressType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "addresses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    @Id
    private String id;
    
    private String country;
    private String city;
    private String street;
    private String phone;
    private String optionalName;

    private AddressType addressType;
    
    private User user;
}
