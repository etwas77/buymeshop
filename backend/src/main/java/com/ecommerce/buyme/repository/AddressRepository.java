package com.ecommerce.buyme.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.buyme.model.Address;

public interface AddressRepository extends MongoRepository<Address, String> {

    List<Address> findByUserId(String userId);

}
