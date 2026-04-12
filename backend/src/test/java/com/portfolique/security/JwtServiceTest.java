package com.portfolique.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

public class JwtServiceTest {

  private JwtService jwtService;
  private final String SECRET =
      "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; // 256-bit secret

  @BeforeEach
  void setUp() {
    jwtService = new JwtService();
    ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
    ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
  }

  @Test
  void testGenerateAndExtractUsername() {
    UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
    String token = jwtService.generateToken(userDetails);

    String username = jwtService.extractUsername(token);
    assertThat(username).isEqualTo("testuser");
  }

  @Test
  void testIsTokenValid_Success() {
    UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
    String token = jwtService.generateToken(userDetails);

    boolean isValid = jwtService.isTokenValid(token, userDetails);
    assertThat(isValid).isTrue();
  }

  @Test
  void testIsTokenValid_WrongUser() {
    UserDetails user1 = new User("user1", "pass", Collections.emptyList());
    UserDetails user2 = new User("user2", "pass", Collections.emptyList());
    String token = jwtService.generateToken(user1);

    boolean isValid = jwtService.isTokenValid(token, user2);
    assertThat(isValid).isFalse();
  }
}
