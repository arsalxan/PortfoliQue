package com.portfolique;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PortfoliQueBackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(PortfoliQueBackendApplication.class, args);
  }
}
