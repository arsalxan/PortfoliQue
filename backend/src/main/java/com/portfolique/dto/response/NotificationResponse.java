package com.portfolique.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
  private Long id;
  private String senderUsername;
  private String senderFullName;
  private Long portfolioId;
  private String type;
  private boolean isRead;
  private LocalDateTime createdAt;
}
