package com.portfolique.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_id")
  private User recipient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sender_id")
  private User sender;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "portfolio_id")
  private Portfolio portfolio;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  @Builder.Default
  private boolean isRead = false;

  @CreationTimestamp private LocalDateTime createdAt;
}
