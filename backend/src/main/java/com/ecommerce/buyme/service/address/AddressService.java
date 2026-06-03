package com.ecommerce.buyme.service.address;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.buyme.model.Address;
import com.ecommerce.buyme.repository.AddressRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressService implements IAddressService {
    private final AddressRepository addressRepository;

    @Override
    public List<Address> createAddresses(List<Address> addresses) {
        return addressRepository.saveAll(addresses);
    }

    @Override
    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Override
    public Address getAddressById(Long addressId) {
        return addressRepository.findById(addressId).orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + addressId));
    }

    @Override
    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new EntityNotFoundException("Address not found with id: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }

    @Override
    public Address updateAddress(Long addressId, Address updatedAddress) {
        Address existingAddress = addressRepository.findById(addressId).orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + addressId));

        existingAddress.setStreet(updatedAddress.getStreet());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setCountry(updatedAddress.getCountry());
        existingAddress.setAddressType(updatedAddress.getAddressType());
        existingAddress.setPhone(updatedAddress.getPhone());
        existingAddress.setOptionalName(updatedAddress.getOptionalName());

        return addressRepository.save(existingAddress);
    }

}
