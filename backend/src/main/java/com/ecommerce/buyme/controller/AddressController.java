package com.ecommerce.buyme.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.AddressDto;
import com.ecommerce.buyme.model.Address;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.address.AddressService;
import com.ecommerce.buyme.service.user.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/addresses")
public class AddressController {
    private final AddressService addressService;
    private final UserService userService;
    private final ModelMapper modelMapper;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getAddressesByUserId(@PathVariable Long userId) {
        List<Address> addresses = addressService.getAddressesByUserId(userId);
        List<AddressDto> addressDtos = addresses.stream()
                .map(address -> modelMapper.map(address, AddressDto.class))
                .toList();

        ApiResponse response = new ApiResponse("Addresses retrieved successfully", addressDtos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse> getAddressById(@PathVariable Long addressId) {
        Address address = addressService.getAddressById(addressId);
        AddressDto addressDto = modelMapper.map(address, AddressDto.class);

        ApiResponse response = new ApiResponse("Address retrieved successfully", addressDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse> updateAddress(@PathVariable Long addressId, @RequestBody AddressDto request) {
        if (request == null || request.getCountry() == null || request.getCountry().isBlank()
                || request.getCity() == null || request.getCity().isBlank()
                || request.getStreet() == null || request.getStreet().isBlank()
                || request.getAddressType() == null) {
            ApiResponse response = new ApiResponse("Address country, city, street and addressType are required", null);
            return ResponseEntity.badRequest().body(response);
        }

        Address updatedAddress = modelMapper.map(request, Address.class);
        Address address = addressService.updateAddress(addressId, updatedAddress);
        AddressDto addressDto = modelMapper.map(address, AddressDto.class);

        ApiResponse response = new ApiResponse("Address updated successfully", addressDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        ApiResponse response = new ApiResponse("Address deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createAddresses(@RequestBody List<AddressDto> addressesDto) {
        if (addressesDto == null || addressesDto.isEmpty()) {
            ApiResponse response = new ApiResponse("Address list must not be null or empty", null);
            return ResponseEntity.badRequest().body(response);
        }

        // boolean hasInvalidItem = addressesDto.stream()
        //         .anyMatch(dto -> dto == null || dto.getUserId() == null);
        // if (hasInvalidItem) {
        //     ApiResponse response = new ApiResponse("Each address must include a valid userId", null);
        //     return ResponseEntity.badRequest().body(response);
        // }

        Map<Long, User> usersById = new HashMap<>();
       
        List<Address> addresses = addressesDto.stream().map(dto -> {
            Address address = new Address();
            address.setCountry(dto.getCountry());
            address.setCity(dto.getCity());
            address.setStreet(dto.getStreet());
            address.setAddressType(dto.getAddressType());
            
            // create address w/o user is ok, can be added later, but if userId is provided, we need to validate it and set the user
            Long userId = dto.getUserId();
            if(userId != null) {
                User user = usersById.computeIfAbsent(userId, userService::getUserById);
                address.setUser(user);
            }
    
            return address;
        })
        .toList();

        List<Address> res = addressService.createAddresses(addresses);
        List<AddressDto> resDto = res.stream().map(address -> modelMapper.map(address, AddressDto.class)).toList();

        ApiResponse response = new ApiResponse("Addresses created successfully", resDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
