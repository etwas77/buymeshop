package com.ecommerce.buyme.service.image;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.repository.ImageRepository;
import com.ecommerce.buyme.request.EmbeddingsDeleteRequest;
import com.ecommerce.buyme.service.chroma.IChromaService;
import com.ecommerce.buyme.service.product.IProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService implements IImageService {

    private final ImageRepository imageRepository;
    private final IProductService productService;
    private final IChromaService chromaService;
    private final ImageAsyncService imageAsyncService;

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
        byte[] imageBytes;
        try {
            imageBytes = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read image file for update with id: " + imageId, e);
        }

        image.setImage(imageBytes);
        image.setFileName(file.getOriginalFilename());
        image.setFileType(file.getContentType());
        imageRepository.save(image);

        EmbeddingsDeleteRequest deleteRequest = EmbeddingsDeleteRequest.builder()
                .collectionId(collectionName)
                .imageId(imageId)
                .build();
        chromaService.deleteEmbeddingByCollectionId(deleteRequest);

        ImageEmbeddingPayload payload = new ImageEmbeddingPayload(
                imageBytes,
                file.getContentType(),
                file.getOriginalFilename(),
                image.getProduct().getId(),
                imageId);
        imageAsyncService.saveEmbeddingsAsync(payload);

    }

    @Override
    public List<ImageDto> saveImages(List<MultipartFile> files, String productId) {
        Product product = productService.getById(productId);

        List<ImageDto> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            byte[] imageBytes;
            try {
                imageBytes = file.getBytes();
            } catch (IOException e) {
                throw new UncheckedIOException("Failed to read image file for product with id: " + productId, e);
            }

            String imageId = new ObjectId().toHexString();
            String downloadUrl = "/api/v1/images/image/download/" + imageId;

            Image image = new Image();
            image.setId(imageId);
            image.setImage(imageBytes);
            image.setFileName(file.getOriginalFilename());
            image.setFileType(file.getContentType());
            image.setProduct(product);
            image.setDownloadUrl(downloadUrl);

            Image savedImage = imageRepository.save(image);

            ImageDto dto = new ImageDto(savedImage.getId(), savedImage.getFileName(), savedImage.getDownloadUrl());
            savedImages.add(dto);

            ImageEmbeddingPayload payload = new ImageEmbeddingPayload(
                    imageBytes,
                    file.getContentType(),
                    file.getOriginalFilename(),
                    productId,
                    savedImage.getId());

            imageAsyncService.saveEmbeddingsAsync(payload);
        }

        return savedImages;
    }

}
