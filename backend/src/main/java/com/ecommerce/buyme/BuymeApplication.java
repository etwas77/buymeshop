package com.ecommerce.buyme;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BuymeApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuymeApplication.class, args);
	}

}
