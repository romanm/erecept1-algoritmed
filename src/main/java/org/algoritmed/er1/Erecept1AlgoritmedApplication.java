package org.algoritmed.er1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource("classpath:config-app-spring.xml")
public class Erecept1AlgoritmedApplication {

	public static void main(String[] args) {
		SpringApplication.run(Erecept1AlgoritmedApplication.class, args);
	}

}
