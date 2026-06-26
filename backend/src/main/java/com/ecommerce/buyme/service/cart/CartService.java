package com.ecommerce.buyme.service.cart;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.buyme.dtos.CartDto;
import com.ecommerce.buyme.dtos.CartItemDto;
import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.repository.CartItemRepository;
import com.ecommerce.buyme.repository.CartRepository;
import com.ecommerce.buyme.repository.ImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService implements ICartService {

    //private final ImageService imageService;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ImageRepository imageRepository;

    // CartService(ImageService imageService) {
    //     this.imageService = imageService;
    // }

    @Override
    public Cart getById(String cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
    }

    @Override
    public Cart getByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user id: " + userId));
    }

    @Transactional
    @Override
    public void clear(String cartId) {
        Cart cart = getById(cartId);
        cartItemRepository.deleteAllByCartId(cartId);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.deleteById(cartId);
    }

    @Override
    public Cart initializeCartForUser(User user) {
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setTotalAmount(BigDecimal.ZERO);
            return cartRepository.save(cart);
        });
    }

    @Override
    public BigDecimal getTotalPrice(String cartId) {
        return getById(cartId).getTotalAmount();
    }

    @Override
    public List<Cart> getAll() {
        return cartRepository.findAll();
    }

    @Override
    public CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setTotalAmount(cart.getTotalAmount());
        dto.setUserId(cart.getUser() != null ? cart.getUser().getId() : null);

        Set<CartItemDto> itemDtos = cart.getItems().stream()
                .map(this::mapToCartItemDto)
                .collect(Collectors.toSet());

        dto.setItems(itemDtos);
        return dto;
    }

    private CartItemDto mapToCartItemDto(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setUnitPrice(cartItem.getUnitPrice());
        dto.setTotalPrice(cartItem.getTotalPrice());

        if (cartItem.getProduct() != null) {
            dto.setProductId(cartItem.getProduct().getId());
            dto.setProductName(cartItem.getProduct().getName());
            dto.setProductBrand(cartItem.getProduct().getBrand());
            String productId = cartItem.getProduct().getId();
            List<Image> images = imageRepository.findByProductId(productId);
            List<ImageDto> imageDtos = images.stream()
                    .map(image -> {
                        ImageDto imageDto = new ImageDto();
                        imageDto.setId(image.getId());
                        imageDto.setDownloadUrl(image.getDownloadUrl());
                        return imageDto;
                    })
                    .collect(Collectors.toList());
            dto.setImages(imageDtos);
        }
        return dto;
    }

}
