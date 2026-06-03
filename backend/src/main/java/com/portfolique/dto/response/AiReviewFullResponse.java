package com.portfolique.dto.response;

import com.portfolique.entity.AiReviewStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiReviewFullResponse {
  private Long id;
  private Long portfolioId;
  private Integer version;
  private AiReviewStatus status;
  private Integer performanceScore;
  private Integer accessibilityScore;
  private Integer seoScore;
  private String jsoupReviewText;
  private String lighthouseReviewText;
  private String finalReviewText;
  private String errorMessage;
  private LocalDateTime createdAt;
}
