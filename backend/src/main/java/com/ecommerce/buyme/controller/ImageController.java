package com.ecommerce.buyme.controller;

import java.util.List;
import java.util.Objects;

import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.LLM.LLMService.LLMService;
import com.ecommerce.buyme.service.image.IImageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("${api.prefix}/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {
    private final IImageService imageService;
    private final LLMService llmService;
    private final ChromaVectorStore chromaVectorStore;

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        List<Image> images = imageService.getAll();
        ApiResponse response = new ApiResponse("Images retrieved successfully", images);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image/download/{imageId}")
    public ResponseEntity<Resource> getById(@PathVariable String imageId) {
        Image image = imageService.getbyId(imageId);
        ByteArrayResource resource = new ByteArrayResource(image.getImage());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/delete/{imageId}/delete")
    public ResponseEntity<ApiResponse> delete(@PathVariable String imageId) {
        imageService.delete(imageId);
        ApiResponse response = new ApiResponse("Image deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{imageId}/update")
    public ResponseEntity<ApiResponse> update(
            @PathVariable("imageId") String imageId,
            @RequestParam MultipartFile file) {

        imageService.update(file, imageId);
        ApiResponse response = new ApiResponse("Image updated successfully", null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadImages(@RequestParam("files") List<MultipartFile> files,
            @RequestParam("productId") String productId) {

        List<ImageDto> savedImages = imageService.saveImages(files, productId);
        ApiResponse response = new ApiResponse("Images uploaded successfully", savedImages);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search-by-image")
    public ResponseEntity<ApiResponse> searchByImage(@RequestParam("file") MultipartFile file) {
        try {
            ImageEmbeddingPayload payload = new ImageEmbeddingPayload(
                        file.getBytes(),
                        file.getContentType(),
                        file.getOriginalFilename(),
                        "",
                        "");

            String imageDescription = llmService.describeImage(payload);

            SearchRequest searchRequest = SearchRequest.builder()
                    .query(imageDescription)
                    .topK(10) // how many results you want to retrieve
                    .similarityThreshold(0.85f) // adjust based on your needs
                    .build();
            List<Document> searchResults = chromaVectorStore.doSimilaritySearch(searchRequest);
            List<String> productIds = searchResults.stream()
                    .map(doc -> doc.getMetadata().get("productId"))
                    .filter(Objects::nonNull)
                    .map(obj -> obj.toString())
                    .toList();

            return ResponseEntity.ok(new ApiResponse("Search results as list of product IDs", productIds));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse("Error processing the file: " + e.getMessage(), null));
        }
    }

}
