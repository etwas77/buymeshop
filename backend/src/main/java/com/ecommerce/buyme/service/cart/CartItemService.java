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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService implements ICartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ICartService cartService;
    private final IProductService productService;

    @Override
    public Cart addItemToCart(String cartId, String productId, int quantity) {
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
                    newItem.setCartId(cart.getId());
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
    public void remove(String cartId, String productId) {
        Cart cart = cartService.getById(cartId);
        CartItem cartItem = getCartItemById(cartId, productId);
        cart.removeItem(cartItem);
        cartRepository.save(cart);
    }

    @Override
    public void updateQuantity(String cartId, String productId, int quantity) {
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
                .map(cartItem -> cartItem.getTotalPrice())
                .reduce(BigDecimal.ZERO, (left, right) -> left.add(right));
        cart.setTotalAmount(totalAmount);
        cartRepository.save(cart);

    }

    @Override
    public CartItem getCartItemById(String cartId, String productId) {
        return cartItemRepository.findByCartIdAndProduct_Id(cartId, productId)
                .orElseThrow(() -> new RuntimeException(
                        "Cart item not found for cart id: " + cartId + " and product id: " + productId));
    }

    @Override
    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

}
