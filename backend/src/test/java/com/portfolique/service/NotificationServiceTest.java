package com.portfolique.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.portfolique.dto.response.NotificationResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Notification;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.NotificationRepository;
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
public class NotificationServiceTest {

  @Mock private NotificationRepository notificationRepository;

  @InjectMocks private NotificationService notificationService;

  private User recipient;
  private User sender;
  private Portfolio portfolio;
  private Feedback feedback;
  private Notification notification;

  @BeforeEach
  void setUp() {
    recipient = User.builder().id(1L).username("recipient").build();
    sender = User.builder().id(2L).username("sender").build();
    portfolio = Portfolio.builder().id(1L).user(recipient).build();
    feedback = Feedback.builder().id(1L).user(sender).portfolio(portfolio).build();
    notification =
        Notification.builder()
            .id(1L)
            .recipient(recipient)
            .sender(sender)
            .portfolio(portfolio)
            .type("new_comment")
            .isRead(false)
            .build();
  }

  @Test
  void testCreateFeedbackNotification() {
    notificationService.createFeedbackNotification(sender, portfolio, feedback);
    verify(notificationRepository, times(1)).save(any(Notification.class));
  }

  @Test
  void testGetNotificationsForUser() {
    Page<Notification> page = new PageImpl<>(List.of(notification));
    when(notificationRepository.findByRecipientOrderByCreatedAtDesc(any(), any())).thenReturn(page);

    Page<NotificationResponse> result =
        notificationService.getNotificationsForUser(recipient, PageRequest.of(0, 10));

    assertThat(result.getContent()).hasSize(1);
    assertThat(result.getContent().get(0).getSenderUsername()).isEqualTo("sender");
  }

  @Test
  void testMarkAsRead_Success() {
    when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

    notificationService.markAsRead(1L, recipient);

    assertThat(notification.isRead()).isTrue();
    verify(notificationRepository).save(notification);
  }

  @Test
  void testMarkAsRead_Forbidden() {
    User otherUser = User.builder().id(3L).username("other").build();
    when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

    assertThrows(
        ResponseStatusException.class, () -> notificationService.markAsRead(1L, otherUser));
  }
}
