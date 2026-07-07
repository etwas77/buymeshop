package com.ecommerce.buyme.request;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class EmbeddingsDeleteRequest {
    private String collectionId;
    private String imageId;
}
 