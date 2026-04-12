package com.portfolique.controller;

import com.portfolique.dto.request.UpdateProfileRequest;
import com.portfolique.dto.response.UserProfileResponse;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.UserService;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;
  private final UserRepository userRepository;

  @GetMapping("/profile")
  public ResponseEntity<UserProfileResponse> getProfile(
      @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.ok(userService.getProfile(currentUser));
  }

  @PutMapping("/profile")
  public ResponseEntity<UserProfileResponse> updateProfile(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestPart("profile") UpdateProfileRequest req,
      @RequestPart(value = "dp", required = false) MultipartFile dp)
      throws IOException {

    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.ok(userService.updateProfile(currentUser, req, dp));
  }

  @DeleteMapping("/profile")
  public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserDetails userDetails)
      throws IOException {
    User currentUser = getCurrentUser(userDetails);
    userService.deleteAccount(currentUser);
    return ResponseEntity.noContent().build();
  }

  private User getCurrentUser(UserDetails userDetails) {
    if (userDetails == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
    }
    return userRepository
        .findByUsername(userDetails.getUsername())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }
}
