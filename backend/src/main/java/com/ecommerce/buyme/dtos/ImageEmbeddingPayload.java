package com.ecommerce.buyme.dtos;

public record ImageEmbeddingPayload(
        byte[] imageBytes,
        String contentType,
        String originalFilename,
        String productId,
        String imageId
) {
}
