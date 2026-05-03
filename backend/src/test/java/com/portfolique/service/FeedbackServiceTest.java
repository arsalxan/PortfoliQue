package com.portfolique.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceTest {

  @Mock private FeedbackRepository feedbackRepository;

  @Mock private PortfolioRepository portfolioRepository;

  @Mock private NotificationService notificationService;

  @Mock private AiService aiService;

  @InjectMocks private FeedbackService feedbackService;

  private User author;
  private User owner;
  private Portfolio portfolio;

  @BeforeEach
  void setUp() {
    author = User.builder().id(1L).username("author").build();
    owner = User.builder().id(2L).username("owner").build();
    portfolio = Portfolio.builder().id(1L).user(owner).build();
  }

  @Test
  void testCreateFeedback_CannotReviewOwn() {
    FeedbackRequest req = new FeedbackRequest();
    when(portfolioRepository.findById(1L)).thenReturn(Optional.of(portfolio));

    assertThrows(
        ResponseStatusException.class, () -> feedbackService.createFeedback(1L, req, owner));
  }

  @Test
  void testCreateFeedback_Success() {
    FeedbackRequest req = new FeedbackRequest();
    req.setDesign("Great design, very clean and professional looking."); // 40+ chars

    when(portfolioRepository.findById(1L)).thenReturn(Optional.of(portfolio));
    when(feedbackRepository.save(any()))
        .thenReturn(
            Feedback.builder()
                .id(1L)
                .design(req.getDesign())
                .user(author)
                .portfolio(portfolio)
                .build());

    FeedbackResponse res = feedbackService.createFeedback(1L, req, author);

    assertThat(res).isNotNull();
    verify(notificationService)
        .createFeedbackNotification(eq(author), eq(portfolio), any(Feedback.class));
  }

  @Test
  void testDeleteFeedback_AuthorizedByAuthor() {
    Feedback feedback = Feedback.builder().id(1L).user(author).portfolio(portfolio).build();
    when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));

    feedbackService.deleteFeedback(1L, author);

    verify(feedbackRepository).delete(feedback);
  }

  @Test
  void testGetMyFeedbacks() {
    Feedback feedback = Feedback.builder().id(1L).user(author).portfolio(portfolio).build();
    Page<Feedback> page = new PageImpl<>(List.of(feedback));
    when(feedbackRepository.findByUserOrderByCreatedAtDesc(eq(author), any())).thenReturn(page);

    Page<FeedbackResponse> result = feedbackService.getMyFeedbacks(author, PageRequest.of(0, 10));

    assertThat(result.getContent()).hasSize(1);
    assertThat(result.getContent().get(0).getUserId()).isEqualTo(author.getId());
    verify(feedbackRepository).findByUserOrderByCreatedAtDesc(eq(author), any());
  }
}
