package com.ecommerce.buyme.service.image;

import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;

public interface IImageSearchService {
    String saveEmbeddings(ImageEmbeddingPayload payload, String productId, String imageId);
}
