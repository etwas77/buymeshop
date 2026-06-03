package com.ecommerce.buyme.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private int amount;
    private String currency;
}
