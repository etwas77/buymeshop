package com.ecommerce.buyme.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.CartDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.cart.ICartService;

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/carts")
public class CartController {
    private final ICartService cartService;

    @GetMapping("/cart/{cartId}")
    public ResponseEntity<ApiResponse> getById(@PathVariable String cartId) {
        Cart cart = cartService.getById(cartId);
        CartDto cartDto = cartService.mapToCartDto(cart);
        return ResponseEntity.ok(new ApiResponse("Cart retrieved successfully", cartDto));
    }

    @GetMapping("/clear/{cartId}")
    public ResponseEntity<ApiResponse> clear(@PathVariable String cartId) {
        cartService.clear(cartId);
        return ResponseEntity.ok(new ApiResponse("Cart cleared successfully", null));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getByUserId(@PathVariable String userId) {
        Cart cart = cartService.getByUserId(userId);
        CartDto cartDto = cartService.mapToCartDto(cart);
        return ResponseEntity.ok(new ApiResponse("Cart retrieved successfully", cartDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        List<Cart> carts = cartService.getAll();
        List<CartDto> cartDtos = carts.stream()
                .map(cartService::mapToCartDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("Carts retrieved successfully", cartDtos));
    }
    
    
}
