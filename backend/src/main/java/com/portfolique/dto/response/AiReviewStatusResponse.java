package com.portfolique.dto.response;

import com.portfolique.entity.AiReviewStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiReviewStatusResponse {
  private Long id;
  private Long portfolioId;
  private String portfolioUrl;
  private Integer version;
  private AiReviewStatus status;
  private LocalDateTime createdAt;
}
