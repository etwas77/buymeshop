package com.ecommerce.buyme.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ecommerce.buyme.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryNameAndBrand(String categoryName, String brand);

    List<Product> findByCategoryName(String categoryName);

    List<Product> findByBrandAndName(String brand, String name);

    List<Product> findByBrand(String brand);

    /*
        This custom JPQL query means: find products whose name contains the given text, case-insensitive.

        SELECT p FROM Product p → query Product entity objects.
        p.name → checks the name field.
        CONCAT('%', :name, '%') → wraps input with % wildcards, so it matches anywhere in the string.
        Example input "phone" matches "iPhone 15", "Phone Case", "Headphone".
        LOWER(...) on both sides → makes comparison case-insensitive.
        So it behaves like:
        WHERE lower(product.name) LIKE '%lower(input)%'.
    */
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByName(String name);

    boolean existsByNameAndBrand(String name, String brand);

}
