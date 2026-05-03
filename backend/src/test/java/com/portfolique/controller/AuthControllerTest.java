package com.portfolique.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolique.dto.request.LoginRequest;
import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
import com.portfolique.security.CustomUserDetailsService;
import com.portfolique.security.JwtAuthenticationFilter;
import com.portfolique.security.JwtService;
import com.portfolique.security.SecurityConfig;
import com.portfolique.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private AuthService authService;

  // Security constraints mock dependencies
  @MockitoBean private JwtService jwtService;

  @MockitoBean private CustomUserDetailsService userDetailsService;

  @Test
  void testRegister_Success() throws Exception {
    RegisterRequest req =
        RegisterRequest.builder()
            .username("newuser")
            .email("test@example.com")
            .fullName("New User")
            .password("password123")
            .build();

    AuthResponse res =
        AuthResponse.builder()
            .token("mock-jwt-token")
            .username("newuser")
            .message("Registration successful")
            .build();

    when(authService.register(any(RegisterRequest.class))).thenReturn(res);

    mockMvc
        .perform(
            post("/api/v1/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token").value("mock-jwt-token"))
        .andExpect(jsonPath("$.message").value("Registration successful"));
  }

  @Test
  void testRegister_Failure_UsernameTaken() throws Exception {
    RegisterRequest req =
        RegisterRequest.builder()
            .username("existinguser")
            .email("test@example.com")
            .fullName("Existing User")
            .password("password123")
            .build();

    when(authService.register(any(RegisterRequest.class)))
        .thenThrow(new RuntimeException("Username already exists"));

    mockMvc
        .perform(
            post("/api/v1/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Username already exists"));
  }

  @Test
  void testLogin_Success() throws Exception {
    LoginRequest req = LoginRequest.builder().username("testuser").password("password123").build();

    AuthResponse res =
        AuthResponse.builder()
            .token("valid-jwt-token")
            .username("testuser")
            .message("Login successful")
            .build();

    when(authService.login(any(LoginRequest.class))).thenReturn(res);

    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").value("valid-jwt-token"))
        .andExpect(jsonPath("$.message").value("Login successful"));
  }

  @Test
  void testLogin_Failure_BadCredentials() throws Exception {
    LoginRequest req =
        LoginRequest.builder().username("testuser").password("wrongpassword").build();

    when(authService.login(any(LoginRequest.class)))
        .thenThrow(new RuntimeException("Invalid credentials"));

    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Invalid credentials"));
  }

  @Test
  void testVerifyEmail_Success() throws Exception {
    AuthResponse res = AuthResponse.builder().message("Email verified successfully").build();

    when(authService.verifyEmail("valid-token")).thenReturn(res);

    mockMvc
        .perform(get("/api/v1/auth/verify-email/valid-token"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Email verified successfully"));
  }

  @Test
  void testVerifyEmail_Failure_InvalidToken() throws Exception {
    when(authService.verifyEmail("invalid-token"))
        .thenThrow(new RuntimeException("Invalid or expired token"));

    mockMvc
        .perform(get("/api/v1/auth/verify-email/invalid-token"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Invalid or expired token"));
  }
}
