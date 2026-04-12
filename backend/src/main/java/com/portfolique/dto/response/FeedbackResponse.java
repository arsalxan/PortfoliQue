package com.portfolique.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeedbackResponse {
  private Long id;
  private String design;
  private String responsiveness;
  private String content;
  private String uxFlow;
  private String accessibility;
  private String technicalPerformance;
  private String additional;
  private Long userId;
  private String username;
  private String fullName;
  private Long portfolioId;
  private String portfolioOwnerUsername;
  private String portfolioOwnerFullName;
  private LocalDateTime createdAt;
}
