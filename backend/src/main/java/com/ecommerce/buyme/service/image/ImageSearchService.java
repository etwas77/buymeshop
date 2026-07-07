package com.ecommerce.buyme.service.image;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;
import com.ecommerce.buyme.service.LLM.LLMService.LLMService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageSearchService implements IImageSearchService {
    private final LLMService llmService;
    private final ChromaVectorStore vectorStore;

    @Override
    public String saveEmbeddings(ImageEmbeddingPayload payload, String productId, String imageId) {
        try {
            String imageDescription = llmService.describeImage(payload);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("productId", productId);
            metadata.put("imageId", imageId);
            metadata.put("documentId", UUID.randomUUID().toString());
            var doc = Document.builder()
                    .id(imageId)
                    .text(imageDescription)
                    .metadata(metadata)
                    .build();

            vectorStore.doAdd(List.of(doc));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save embeddings for image with id: " + imageId, e);
        }
        return "Successfully added to vector store image " + imageId + " for product " + productId;
    }

}
