package com.ecommerce.buyme.service.address;

import java.util.List;

import com.ecommerce.buyme.model.Address;

public interface IAddressService {
    List<Address> createAddresses(List<Address> addresses);

    List<Address> getAddressesByUserId(Long userId);

    Address getAddressById(Long addressId);

    void deleteAddress(Long addressId);

    Address updateAddress(Long addressId, Address updatedAddress);
}
