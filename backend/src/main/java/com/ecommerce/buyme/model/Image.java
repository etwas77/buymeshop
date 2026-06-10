package com.ecommerce.buyme.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "images")
@Getter
@Setter
@NoArgsConstructor
public class Image {
    @Id
    private String id;

    private String fileName;
    private String fileType;
    private String downloadUrl;

    private byte[] image;

    private Product product;
}
