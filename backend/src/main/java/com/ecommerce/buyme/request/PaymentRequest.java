package com.ecommerce.buyme.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PaymentRequest {
    private BigDecimal amount;
    private String currency;
}
