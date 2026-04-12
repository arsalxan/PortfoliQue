package com.portfolique.service;

import com.portfolique.dto.response.NotificationResponse;
import com.portfolique.entity.Notification;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.NotificationRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;

  @Transactional
  public void createFeedbackNotification(User sender, Portfolio portfolio) {
    Notification notification =
        Notification.builder()
            .sender(sender)
            .recipient(portfolio.getUser())
            .portfolio(portfolio)
            .type("new_comment")
            .isRead(false)
            .build();
    notificationRepository.save(notification);
  }

  @Transactional(readOnly = true)
  public Page<NotificationResponse> getNotificationsForUser(User user, Pageable pageable) {
    return notificationRepository
        .findByRecipientOrderByCreatedAtDesc(user, pageable)
        .map(this::mapToResponse);
  }

  @Transactional(readOnly = true)
  public Long getUnreadCount(User user) {
    return notificationRepository.countByRecipientAndIsReadFalse(user);
  }

  @Transactional(readOnly = true)
  public List<NotificationResponse> getUnreadPreview(User user) {
    return notificationRepository
        .findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(user)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public void markAllAsRead(User user) {
    notificationRepository.markAllAsReadForRecipient(user);
  }

  @Transactional
  public void markAsRead(Long notificationId, User user) {
    Notification notification =
        notificationRepository
            .findById(notificationId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

    if (!notification.getRecipient().getId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
    }

    notification.setRead(true);
    notificationRepository.save(notification);
  }

  private NotificationResponse mapToResponse(Notification notification) {
    return NotificationResponse.builder()
        .id(notification.getId())
        .senderUsername(notification.getSender().getUsername())
        .senderFullName(notification.getSender().getFullName())
        .portfolioId(notification.getPortfolio().getId())
        .type(notification.getType())
        .isRead(notification.isRead())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
