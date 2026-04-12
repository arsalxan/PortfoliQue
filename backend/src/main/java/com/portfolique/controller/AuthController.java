package com.portfolique.controller;

import com.portfolique.dto.request.LoginRequest;
import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
import com.portfolique.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    try {
      AuthResponse response = authService.register(request);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    try {
      AuthResponse response = authService.login(request);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/verify-email/{token}")
  public ResponseEntity<?> verifyEmail(@PathVariable String token) {
    try {
      AuthResponse response = authService.verifyEmail(token);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}
