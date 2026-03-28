package com.ecommerce.buyme.service.cart;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.buyme.dtos.CartDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.User;

public interface ICartService {
    List<Cart> getAll();

    Cart getById(Long cartId);

    Cart getByUserId(Long userId);

    void clear(Long cartId);

    Cart initializeCartForUser(User user);

    BigDecimal getTotalPrice(Long cartId);


    CartDto mapToCartDto(Cart cart);
}
