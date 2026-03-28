package com.ecommerce.buyme.service.product;

import java.util.List;

import com.ecommerce.buyme.dtos.ProductDto;
import com.ecommerce.buyme.model.Category;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.request.AddProductRequest;
import com.ecommerce.buyme.request.ProductUpdateRequest;

public interface IProductService {
    Product add(AddProductRequest product);

    Product update(ProductUpdateRequest request, Long productId);

    Product getById(Long productId);

    void delete(Long productId);

    List<Product> getAll();

    List<Product> getByCategoryAndBrand(Category category, String brand);

    List<Product> getByBrandAndName(String brand, String name);

    List<Product> getByCategory(Category category);

    List<Product> getByBrand(String brand);

    List<Product> getByName(String name);

    List<ProductDto> convertProductsToDto(List<Product> products);

    ProductDto convertToDto(Product product);

    List<Product> findDistinctProductsByNameList();
}
