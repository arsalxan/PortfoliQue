package com.portfolique.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "ai_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReview {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "portfolio_id", nullable = false)
  private Portfolio portfolio;

  @Column(nullable = false)
  private Integer version;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AiReviewStatus status;

  @Column private String jsoupFingerprint;
  @Column private String lighthouseFingerprint;

  @Column private Integer performanceScore;
  @Column private Integer accessibilityScore;
  @Column private Integer seoScore;

  @Column(columnDefinition = "TEXT")
  private String jsoupReviewText;

  @Column(columnDefinition = "TEXT")
  private String lighthouseReviewText;

  @Column(columnDefinition = "TEXT")
  private String finalReviewText;

  @Column(columnDefinition = "TEXT")
  private String errorMessage;

  @CreationTimestamp private LocalDateTime createdAt;
}
