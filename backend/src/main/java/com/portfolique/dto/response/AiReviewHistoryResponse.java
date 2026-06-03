package com.portfolique.dto.response;

import com.portfolique.entity.AiReviewStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiReviewHistoryResponse {
  private Long id;
  private Integer version;
  private AiReviewStatus status;
  private Integer performanceScore;
  private Integer accessibilityScore;
  private Integer seoScore;
  private LocalDateTime createdAt;
}
