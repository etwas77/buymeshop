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
        cartItem.setCartId(null);
        recalculateTotalAmount();
    }

    private void recalculateTotalAmount() {
        this.totalAmount = items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void add(CartItem cartItem) {
        cartItem.setCartId(this.id); // updates cartitem with current cart id
        this.items.add(cartItem);
        recalculateTotalAmount();
    }
}
