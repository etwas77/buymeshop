package com.ecommerce.buyme.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.buyme.model.Image;

public interface ImageRepository extends JpaRepository<Image, Long>   {
	List<Image> findByProductId(Long productId);
}
