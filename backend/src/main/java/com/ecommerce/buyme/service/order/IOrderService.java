package com.ecommerce.buyme.service.order;

import java.util.List;

import com.ecommerce.buyme.dtos.OrderDto;
import com.ecommerce.buyme.model.Order;
import com.ecommerce.buyme.request.PaymentRequest;
import com.stripe.exception.StripeException;

public interface IOrderService {
    Order placeOrder(Long userId);

    List<OrderDto> getOrdersByUserId(Long userId);

    OrderDto convertToDto(Order order);

    String createPaymentIntent(PaymentRequest paymentRequest) throws StripeException;
}
