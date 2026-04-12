package com.portfolique.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PortfolioResponse {
  private Long id;
  private String url;
  private String description;
  private String screenshot;
  private String gitRepo;
  private Long userId;
  private String username;
  private String fullName;
  private Long feedbackCount;
  private LocalDateTime createdAt;
}
