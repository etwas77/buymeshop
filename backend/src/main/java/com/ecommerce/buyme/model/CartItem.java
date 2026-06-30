package com.ecommerce.buyme.model;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    private String id;

    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    private Product product;

    private String cartId;

    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CartItem cartItem = (CartItem) o;

        return id != null ? id.equals(cartItem.id) : cartItem.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }   
}
