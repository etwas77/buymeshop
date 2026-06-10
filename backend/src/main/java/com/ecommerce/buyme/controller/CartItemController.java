package com.ecommerce.buyme.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.CartDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.cart.ICartItemService;
import com.ecommerce.buyme.service.cart.ICartService;
import com.ecommerce.buyme.service.user.IUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/cartItems")
@Slf4j
public class CartItemController {
    private final ICartItemService cartItemService;
    private final IUserService userService;
    private final ICartService cartService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addItemToCart(@RequestParam String productId, @RequestParam int quantity) {
        User user = userService.getAuthenticatedUser();
        Cart cart = cartService.initializeCartForUser(user);
        Cart saved = cartItemService.addItemToCart(cart.getId(), productId, quantity);
        CartDto cartDto = cartService.mapToCartDto(saved);
        return ResponseEntity.ok(new ApiResponse("CartItem added to Cart for userId " + user.getId(), cartDto));
    }

    @DeleteMapping("/remove/{cartId}/{productId}")
    public ResponseEntity<ApiResponse> remove(@PathVariable String cartId, @PathVariable String productId) {
        cartItemService.remove(cartId, productId);
        return ResponseEntity.ok(new ApiResponse("Cart item removed successfully", null));
    }

    @PutMapping("/update/{cartId}/{productId}")
    public ResponseEntity<ApiResponse> updateQuantity(@PathVariable String cartId, @PathVariable String productId,
            @RequestParam int quantity) {
        cartItemService.updateQuantity(cartId, productId, quantity);
        return ResponseEntity.ok(new ApiResponse("Cart item quantity updated successfully", null));
    }

    @GetMapping("/item/{cartId}/{productId}")
    public ResponseEntity<ApiResponse> getCartItemById(@PathVariable String cartId, @PathVariable String productId) {
        CartItem cartItem = cartItemService.getCartItemById(cartId, productId);
        return ResponseEntity.ok(new ApiResponse("Cart item retrieved successfully", cartItem));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCartItems() {
        return ResponseEntity
                .ok(new ApiResponse("Cart items retrieved successfully", cartItemService.getAllCartItems()));
    }

}
