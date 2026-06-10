package com.ecommerce.buyme.model;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "carts")
@Getter
@Setter
@NoArgsConstructor
public class Cart {
    @Id
    private String id;

    private BigDecimal totalAmount;

    private User user;

    private Set<CartItem> items = new HashSet<>();

    public void removeItem(CartItem cartItem) {
        this.items.remove(cartItem);
        cartItem.setCart(null); // updates cartitem with current cart (since cartitem has a reference to cart) -
                                // so it breaks the association between cart and cartitem
        recalculateTotalAmount();
    }

    private void recalculateTotalAmount() {
        this.totalAmount = items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void add(CartItem cartItem) {
        cartItem.setCart(this); // updates cartitem with current cart (since cartitem has a reference to cart)
        this.items.add(cartItem);
        recalculateTotalAmount();
    }
}
