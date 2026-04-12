package com.portfolique.config;

import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) {
    if (!userRepository.existsByUsername("admin")) {
      log.info("Seeding admin user...");
      User admin =
          User.builder()
              .username("admin")
              .email("admin@gmail.com")
              .fullName("System Administrator")
              .password(passwordEncoder.encode("admin123"))
              .role(Role.ADMIN)
              .emailVerified(true)
              .build();
      userRepository.save(admin);
      log.info("Admin user created successfully.");
    } else {
      log.info("Admin user already exists. Skipping seed.");
    }
  }
}
