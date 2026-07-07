package com.ecommerce.buyme.service.image;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageAsyncService {
    private final IImageSearchService imageSearchService;

    @Async("imageSummaryExecutor")
    public void saveEmbeddingsAsync(ImageEmbeddingPayload payload) {
        log.info("Async thread: {}", Thread.currentThread().getName());
        try {
            String imageSummary = imageSearchService.saveEmbeddings(
                payload,
                payload.productId(),
                payload.imageId()
        );
            log.info("Stored image summary: {}", imageSummary);
        } catch (Exception e) {
            log.error("Failed to save embeddings for image with id: " + payload.imageId(), e);
        }
    }
}
