package com.ecommerce.buyme.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.OrderDto;
import com.ecommerce.buyme.model.Order;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.request.PaymentRequest;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.order.IOrderService;
import com.ecommerce.buyme.service.user.IUserService;
import com.stripe.exception.StripeException;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/orders")
public class OrderController {
    private final IOrderService orderService;
    private final IUserService userService;

    @PostMapping("/order")
    public ResponseEntity<ApiResponse> placeOrder() {
        User user = userService.getAuthenticatedUser();
        Order order = orderService.placeOrder(user.getId());
        OrderDto orderDto = orderService.convertToDto(order);
        return ResponseEntity.ok(new ApiResponse("Order placed successfully", orderDto));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getOrdersByAuthenticatedUser() {
        User user = userService.getAuthenticatedUser();
        List<OrderDto> orders = orderService.getOrdersByUserId(user.getId());
        return ResponseEntity.ok(new ApiResponse("Orders retrieved successfully", orders));
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse> createPaymentIntent(@RequestBody PaymentRequest request) throws StripeException {
        String clientSecret = orderService.createPaymentIntent(request);
        return ResponseEntity.ok(new ApiResponse("Payment intent created successfully", clientSecret));
    }

}
