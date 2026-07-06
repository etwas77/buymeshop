package com.ecommerce.buyme.service.image;

import org.springframework.web.multipart.MultipartFile;

public interface IImageSearchService {
    String saveEmbeddings(MultipartFile file, String productId, String imageId);
}
