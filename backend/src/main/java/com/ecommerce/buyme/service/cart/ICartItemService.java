package com.ecommerce.buyme.service.cart;

import java.util.List;

import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;

public interface ICartItemService {
    Cart addItemToCart(Long cartId, Long productId, int quantity);
    void remove(Long cartId, Long productId);
    void updateQuantity(Long cartId, Long productId, int quantity);
    CartItem getCartItemById(Long cartId, Long productId);

    List<CartItem> getAllCartItems();
}
