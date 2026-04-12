package com.portfolique.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
  private Long id;
  private String username;
  private String email;
  private String fullName;
  private String profilePicture;
  private String role;
  private boolean emailVerified;
  private LocalDateTime createdAt;
}
