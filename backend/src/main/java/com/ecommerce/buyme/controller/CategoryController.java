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

import com.ecommerce.buyme.category.ICategoryService;
import com.ecommerce.buyme.model.Category;
import com.ecommerce.buyme.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final ICategoryService categoryService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<Category> categories = categoryService.getAll();
        ApiResponse response = new ApiResponse("Categories retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> add(@RequestBody Category category) {
        Category addedCategory = categoryService.add(category);
        ApiResponse response = new ApiResponse("Category added successfully", addedCategory);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse> update(@RequestBody Category category, @PathVariable String id) {
        Category updatedCategory = categoryService.update(category, id);
        ApiResponse response = new ApiResponse("Category updated successfully", updatedCategory);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable String id) {
        categoryService.delete(id);
        ApiResponse response = new ApiResponse("Category deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{name}/category")
    public ResponseEntity<ApiResponse> getByName(@PathVariable String name) {
        Category category = categoryService.getByName(name);
        ApiResponse response = new ApiResponse("Category retrieved successfully", category);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{id}/category")
    public ResponseEntity<ApiResponse> getById(@PathVariable String id) {
        Category category = categoryService.getById(id);
        ApiResponse response = new ApiResponse("Category retrieved successfully", category);
        return ResponseEntity.ok(response);
    }

}
