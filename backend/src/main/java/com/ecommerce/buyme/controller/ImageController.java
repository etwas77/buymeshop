package com.ecommerce.buyme.controller;

import java.sql.SQLException;
import java.util.List;

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
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.image.IImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/images")
@RequiredArgsConstructor
public class ImageController {

    private final IImageService imageService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        List<Image> images = imageService.getAll();
        ApiResponse response = new ApiResponse("Images retrieved successfully", images);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image/download/{imageId}")
    public ResponseEntity<Resource> getById(@PathVariable Long imageId) {

        Image image = imageService.getbyId(imageId);
        ByteArrayResource resource;
        try {
            resource = new ByteArrayResource(
                    image.getImage().getBytes(1, (int) image.getImage().length()));
        } catch (SQLException e) {
            throw new RuntimeException("Failed to read image data for image id: " + imageId, e);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/delete/{imageId}/delete")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long imageId) {
        imageService.delete(imageId);
        ApiResponse response = new ApiResponse("Image deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{imageId}/update")
    public ResponseEntity<ApiResponse> update(@RequestParam MultipartFile file, @PathVariable("imageId") Long imageId) {
        imageService.update(file, imageId);
        ApiResponse response = new ApiResponse("Image updated successfully", null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadImages(@RequestParam("files") List<MultipartFile> files,
            @RequestParam("productId") Long productId) {

        List<ImageDto> savedImages = imageService.saveImages(files, productId);
        ApiResponse response = new ApiResponse("Images uploaded successfully", savedImages);
        return ResponseEntity.ok(response);
    }

}
