package com.portfolique.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PortfolioRequest {

  @NotBlank(message = "URL is required")
  @Pattern(regexp = "^(https?://).+", message = "URL must start with http:// or https://")
  private String url;

  @Size(max = 2000, message = "Description must be less than 2000 characters")
  private String description;

  @Pattern(
      regexp = "^$|^(https?://).+",
      message = "Git Repository URL must start with http:// or https://")
  private String gitRepo;
}
