package com.portfolique.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserProfileResponse {
  private Long id;
  private String username;
  private String email;
  private String fullName;
  private String profilePicture;
  private String role;
  private boolean emailVerified;
  private LocalDateTime createdAt;

  // Stats
  private long portfolioCount;
  private long feedbackCount;
}
