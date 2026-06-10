package com.ecommerce.buyme.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.buyme.model.Address;

@Repository
public interface AddressRepository extends MongoRepository<Address, String> {

    List<Address> findByUserId(String userId);

}
