package com.ecommerce.buyme.service.image;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.repository.ImageRepository;
import com.ecommerce.buyme.request.EmbeddingsDeleteRequest;
import com.ecommerce.buyme.service.chroma.ChromaService;
import com.ecommerce.buyme.service.product.IProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService implements IImageService {

    private final ImageRepository imageRepository;
    private final IProductService productService;
    private final ChromaService chromaService;
    private final ImageSearchService imageSearchService;

    @Value("${spring.ai.vectorstore.chroma.collection-name}")
    private String collectionName;

    @Override
    public List<Image> getAll() {
        return imageRepository.findAll();
    }

    @Override
    public Image getbyId(String imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("No such image with id exists: " + imageId));
    }

    @Override
    public void delete(String imageId) {
        imageRepository.findById(imageId).map(im -> {
            imageRepository.delete(im);

            EmbeddingsDeleteRequest deleteRequest = EmbeddingsDeleteRequest.builder()
                    .collectionId(collectionName)
                    .imageId(imageId)
                    .build();
            chromaService.deleteEmbeddingByCollectionId(deleteRequest);
            log.info("Deleted image with id: {} and its embeddings from collection: {}", imageId, collectionName);

            return im;
        }).orElseThrow(() -> new RuntimeException("No such image with id exists: " + imageId));
    }

    @Override
    public void update(MultipartFile file, String imageId) {
        Image image = getbyId(imageId);
        try {
            image.setImage(file.getBytes());
            image.setFileName(file.getOriginalFilename());
            image.setFileType(file.getContentType());
            imageRepository.save(image);

            EmbeddingsDeleteRequest deleteRequest = EmbeddingsDeleteRequest.builder()
                    .collectionId(collectionName)
                    .imageId(imageId)
                    .build();
            chromaService.deleteEmbeddingByCollectionId(deleteRequest);
            String imageSummary = getImageSummary(image.getProduct().getId(), file, image);
            log.info("Image summary {}", imageSummary);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update image with id: " + imageId + ". Error: " + e.getMessage());
        }
    }

    @Override
    public List<ImageDto> saveImages(List<MultipartFile> files, String productId) {
        Product product = productService.getById(productId);

        List<ImageDto> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                String imageId = new ObjectId().toHexString();
                String downloadUrl = "/api/v1/images/image/download/" + imageId;

                Image image = new Image();
                image.setId(imageId);
                image.setImage(file.getBytes());
                image.setFileName(file.getOriginalFilename());
                image.setFileType(file.getContentType());
                image.setProduct(product);
                image.setDownloadUrl(downloadUrl);

                Image savedImage = imageRepository.save(image);

                ImageDto dto = new ImageDto(savedImage.getId(), savedImage.getFileName(), savedImage.getDownloadUrl());
                savedImages.add(dto);

                String imageSummary = getImageSummary(productId, file, savedImage);
                log.info("Stored image summary embedded ids: {}", imageSummary);
            } catch (IOException e) {
                throw new RuntimeException(
                        "Failed to save image for product with id: " + productId + ". Error: " + e.getMessage());
            }
        }

        return savedImages;
    }

    private String getImageSummary(String productId, MultipartFile file, Image savedImage) {
        return String.valueOf(
                imageSearchService.saveEmbeddings(file, productId, savedImage.getId()));
    }

}
