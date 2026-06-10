package com.ecommerce.buyme.service.cart;

import java.util.List;

import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;

public interface ICartItemService {
    Cart addItemToCart(String cartId, String productId, int quantity);
    void remove(String cartId, String productId);
    void updateQuantity(String cartId, String productId, int quantity);
    CartItem getCartItemById(String cartId, String productId);

    List<CartItem> getAllCartItems();
}
