package com.ecommerce.buyme.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.Image;

public interface ImageRepository extends MongoRepository<Image, String>   {
	List<Image> findByProductId(String productId);
}
