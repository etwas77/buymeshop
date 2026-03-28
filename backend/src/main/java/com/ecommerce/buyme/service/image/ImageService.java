package com.ecommerce.buyme.service.image;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.repository.ImageRepository;
import com.ecommerce.buyme.service.product.IProductService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService implements IImageService {

    private final ImageRepository imageRepository;
    private final IProductService productService;

    @Override
    public List<Image> getAll() {
        return imageRepository.findAll();
    }

    @Override
    public Image getbyId(Long imageId) {
        return imageRepository.findById(imageId).orElseThrow(() -> new EntityNotFoundException("No such image with id exists: " + imageId));
    }

    @Override
    public void delete(Long imageId) {
        imageRepository.findById(imageId).map(im -> {
            imageRepository.delete(im);
            return im;
        }).orElseThrow(() -> new EntityNotFoundException("No such image with id exists: " + imageId));
    }

    @Override
    public void update(MultipartFile file, Long imageId) {
        Image image = getbyId(imageId);
        try {
            image.setImage(new SerialBlob(file.getBytes()));
            image.setFileName(file.getOriginalFilename());
            image.setFileType(file.getContentType());
            imageRepository.save(image);
        } catch (IOException | SQLException e) {
            throw new RuntimeException("Failed to update image with id: " + imageId + ". Error: " + e.getMessage());
        }
    }

    @Override
    public List<ImageDto> saveImages(List<MultipartFile> files, Long productId) {
        Product product = productService.getById(productId);

        List<ImageDto> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                Image image = new Image();
                image.setImage(new SerialBlob(file.getBytes()));
                image.setFileName(file.getOriginalFilename());
                image.setFileType(file.getContentType());
                image.setProduct(product);

                Image savedImage = imageRepository.save(image);

                String downloadUrl = "/api/v1/images/image/download/" + savedImage.getId();
                savedImage.setDownloadUrl(downloadUrl);

                savedImage = imageRepository.save(savedImage);

                ImageDto dto = new ImageDto(savedImage.getId(), savedImage.getFileName(), savedImage.getDownloadUrl());
                savedImages.add(dto);
            } catch (IOException | SQLException e) {
                throw new RuntimeException(
                        "Failed to save image for product with id: " + productId + ". Error: " + e.getMessage());
            }
        }

        return savedImages;
    }

}
