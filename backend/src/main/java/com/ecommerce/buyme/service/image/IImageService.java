package com.ecommerce.buyme.service.image;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.model.Image;

public interface IImageService {

    List<Image> getAll();

    Image getbyId(String imageId);

    void delete(String imageId);

    void update(MultipartFile file, String imageId);

    List<ImageDto> saveImages(List<MultipartFile> files, String productId);
}
