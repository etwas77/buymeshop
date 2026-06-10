package com.ecommerce.buyme.service.cart;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.buyme.dtos.CartDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.User;

public interface ICartService {
    List<Cart> getAll();

    Cart getById(String cartId);

    Cart getByUserId(String userId);

    void clear(String cartId);

    Cart initializeCartForUser(User user);

    BigDecimal getTotalPrice(String cartId);


    CartDto mapToCartDto(Cart cart);
}
