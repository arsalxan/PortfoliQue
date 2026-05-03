package com.portfolique.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(columnDefinition = "TEXT")
  private String design;

  @Column(columnDefinition = "TEXT")
  private String responsiveness;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(columnDefinition = "TEXT")
  private String uxFlow;

  @Column(columnDefinition = "TEXT")
  private String accessibility;

  @Column(columnDefinition = "TEXT")
  private String technicalPerformance;

  @Column(columnDefinition = "TEXT")
  private String additional;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "portfolio_id")
  private Portfolio portfolio;

  // The notification created when this feedback was submitted.
  // Cascade ensures it is deleted automatically when this feedback is deleted.
  @Builder.Default
  @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Notification> notifications = new ArrayList<>();

  @CreationTimestamp private LocalDateTime createdAt;

  @UpdateTimestamp private LocalDateTime updatedAt;
}
