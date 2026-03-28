package com.ecommerce.buyme.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.ProductDto;
import com.ecommerce.buyme.model.Category;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.request.AddProductRequest;
import com.ecommerce.buyme.request.ProductUpdateRequest;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.product.IProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        List<Product> products = productService.getAll();
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse> getById(@PathVariable("productId") Long productId) {
        Product product = productService.getById(productId);
        ProductDto productDto = productService.convertToDto(product);
        ApiResponse response = new ApiResponse("Product retrieved successfully", productDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> add(@RequestBody AddProductRequest request) {
        Product product = productService.add(request);
        ProductDto productDto = productService.convertToDto(product);
        ApiResponse response = new ApiResponse("Product added successfully", productDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<ApiResponse> update(@RequestBody ProductUpdateRequest request,
            @PathVariable("productId") Long productId) {

        Product product = productService.update(request, productId);
        ProductDto productDto = productService.convertToDto(product);
        ApiResponse response = new ApiResponse("Product updated successfully", productDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<ApiResponse> delete(@PathVariable("productId") Long productId) {
        productService.delete(productId);
        ApiResponse response = new ApiResponse("Product deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("product/brandandname/{brand}/{name}")
    public ResponseEntity<ApiResponse> getByBrandAndName(@PathVariable("brand") String brand,
            @PathVariable("name") String name) {

        List<Product> products = productService.getByBrandAndName(brand, name);
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @PostMapping("category")
    public ResponseEntity<ApiResponse> getByCategory(@RequestBody Category category) {
        List<Product> products = productService.getByCategory(category);
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("product/brand/{brand}")
    public ResponseEntity<ApiResponse> getByBrand(@PathVariable("brand") String brand) {
        List<Product> products = productService.getByBrand(brand);
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("product/name/{name}")
    public ResponseEntity<ApiResponse> getByName(@PathVariable("name") String name) {
        List<Product> products = productService.getByName(name);
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("product/catandbrand/{brand}")
    public ResponseEntity<ApiResponse> getByCategoryAndBrand(@RequestBody Category category,
            @PathVariable("brand") String brand) {

        List<Product> products = productService.getByCategoryAndBrand(category, brand);
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Products retrieved successfully", productDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/distinct")
    public ResponseEntity<ApiResponse> getDistinctProductsByName() {
        List<Product> products = productService.findDistinctProductsByNameList();
        List<ProductDto> productDtos = productService.convertProductsToDto(products);

        ApiResponse response = new ApiResponse("Distinct products retrieved successfully", productDtos);
        return ResponseEntity.ok(response); 
    }

}
