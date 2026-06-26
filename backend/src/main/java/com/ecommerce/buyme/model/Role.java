package com.ecommerce.buyme.model;

import java.util.Collection;
import java.util.HashSet;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {
    @Id
    private String id;
    private String name;

    private Collection<User> users = new HashSet<User>();

    public Role(String name) {
        this.name = name;
    }
}
