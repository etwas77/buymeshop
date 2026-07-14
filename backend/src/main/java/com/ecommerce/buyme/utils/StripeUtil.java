package com.ecommerce.buyme.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.stripe.StripeClient;

@Configuration
public class StripeUtil {

    @Bean
    StripeClient stripeClient(@Value("${stripe.secret.key}") String apiKey) {
        return new StripeClient(apiKey);
    }
}
