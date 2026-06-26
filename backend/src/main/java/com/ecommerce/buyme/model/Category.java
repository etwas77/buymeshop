package com.ecommerce.buyme.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {
    @Id
    private String id;
    private String name;
    
    @JsonIgnore
    private List<Product> products;

    public Category(String name) {
        this.name = name;
    }
}
