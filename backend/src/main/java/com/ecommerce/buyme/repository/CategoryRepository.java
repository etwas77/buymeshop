package com.ecommerce.buyme.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {

    Category findByName(String name);

}
