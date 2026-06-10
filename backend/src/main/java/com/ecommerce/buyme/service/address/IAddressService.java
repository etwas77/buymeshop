package com.ecommerce.buyme.service.address;

import java.util.List;

import com.ecommerce.buyme.model.Address;

public interface IAddressService {
    List<Address> createAddresses(List<Address> addresses);

    List<Address> getAddressesByUserId(String userId);

    Address getAddressById(String addressId);

    void deleteAddress(String addressId);

    Address updateAddress(String addressId, Address updatedAddress);
}
