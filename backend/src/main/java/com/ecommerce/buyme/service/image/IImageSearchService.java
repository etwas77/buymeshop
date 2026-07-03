package com.ecommerce.buyme.service.image;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface IImageSearchService {
    List<String> saveEmbeddings(MultipartFile file, String productId, String imageId);
}
