package com.ecommerce.buyme.controller;

import java.util.List;

import org.springframework.ai.chroma.vectorstore.ChromaApi.Collection;
import org.springframework.ai.chroma.vectorstore.ChromaApi.GetEmbeddingResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.request.EmbeddingsDeleteRequest;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.chroma.IChromaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/chroma")
@RequiredArgsConstructor
public class ChromaController {
    private final IChromaService chromaService;

    @GetMapping("/collections")
    public ResponseEntity<ApiResponse> getAllCollections() {
        List<Collection> collections = chromaService.getAllCollections();
        return ResponseEntity.ok(new ApiResponse("Collections retrieved successfully", collections));
    }

    @DeleteMapping("/delete/{collectionId}")
    public ResponseEntity<ApiResponse> deleteCollection(@PathVariable String collectionId) {
        chromaService.deleteCollection(collectionId);
        return ResponseEntity.ok(new ApiResponse("Collection deleted successfully", null));
    }

    @GetMapping("/collections/{collectionName}")
    public ResponseEntity<ApiResponse> getCollection(@PathVariable String collectionName) {
        Collection collection = chromaService.getCollectionByName(collectionName);
        return ResponseEntity.ok(new ApiResponse("Collection retrieved successfully", collection));
    }

    @DeleteMapping("/embeddings/delete")
    public ResponseEntity<ApiResponse> deleteCollection(@RequestBody EmbeddingsDeleteRequest deleteRequest) {
        chromaService.deleteEmbeddingByCollectionId(deleteRequest);
        return ResponseEntity.ok(new ApiResponse("Embeddings deleted successfully", null));
    }

    @GetMapping("/embeddings/{collectionId}")
    public ResponseEntity<ApiResponse> getEmbeddings(@PathVariable String collectionId) {
        GetEmbeddingResponse embeddings = chromaService.getEmbeddings(collectionId);
        return ResponseEntity.ok(new ApiResponse("Embeddings retrieved successfully", embeddings));
    }

}
