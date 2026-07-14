package com.ecommerce.buyme.dtos;

import java.util.Objects;

public record ImageEmbeddingPayload(
        byte[] imageBytes,
        String contentType,
        String originalFilename,
        String productId,
        String imageId
) {
    public ImageEmbeddingPayload {
        imageBytes = Objects.requireNonNull(
            imageBytes,
            "imageBytes must not be null"
        ).clone();
    }
    
    @Override
    public byte[] imageBytes() {
        return imageBytes.clone();
    }
}
   
