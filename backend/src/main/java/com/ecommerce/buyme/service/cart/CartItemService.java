package com.ecommerce.buyme.service.cart;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.repository.CartItemRepository;
import com.ecommerce.buyme.repository.CartRepository;
import com.ecommerce.buyme.service.product.IProductService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService implements ICartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ICartService cartService;
    private final IProductService productService;

    @Override
    public Cart addItemToCart(Long cartId, Long productId, int quantity) {
        Cart cart = cartService.getById(cartId);
        Product product = productService.getById(productId);
        Set<CartItem> items = Optional.ofNullable(cart.getItems()).orElse(Collections.emptySet());

        CartItem cartItem = items.stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .map(item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    return item;
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(quantity);
                    newItem.setUnitPrice(product.getPrice());
                    return newItem;
                });
        cartItem.calculateTotalPrice();
        cart.add(cartItem);
        cartItemRepository.save(cartItem);
        return cartRepository.save(cart);
    }

    @Override
    public void remove(Long cartId, Long productId) {
        Cart cart = cartService.getById(cartId);
        CartItem cartItem = getCartItemById(cartId, productId);
        cart.removeItem(cartItem);
        cartRepository.save(cart);
    }

    @Override
    public void updateQuantity(Long cartId, Long productId, int quantity) {
        Cart cart = cartService.getById(cartId);
        cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQuantity(quantity);
                    item.setUnitPrice(item.getProduct().getPrice());
                    item.calculateTotalPrice();
                });
        BigDecimal totalAmount = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(totalAmount);
        cartRepository.save(cart);

    }

    @Override
    public CartItem getCartItemById(Long cartId, Long productId) {
        return cartItemRepository.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Cart item not found for cart id: " + cartId + " and product id: " + productId));
    }

    @Override
    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

}
