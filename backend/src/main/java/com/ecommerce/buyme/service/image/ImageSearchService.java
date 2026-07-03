package com.ecommerce.buyme.service.image;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.service.chroma.LLMServiceUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageSearchService implements IImageSearchService {
    private final LLMServiceUtil llmServiceUtil;
    private final ChromaVectorStore vectorStore;

    @Override
    public List<String> saveEmbeddings(MultipartFile image, String productId, String imageId) {
        try {
            String imageDescription = llmServiceUtil.descriptionImage(image);
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

        return List.of("successfully added to vector store");
    }

}
