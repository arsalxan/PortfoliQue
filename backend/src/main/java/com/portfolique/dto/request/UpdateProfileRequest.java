package com.portfolique.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
  @NotBlank(message = "Full name is required")
  private String fullName;

  @Email(message = "Invalid email format")
  private String email;

  private String currentPassword;
  private String newPassword;
}
