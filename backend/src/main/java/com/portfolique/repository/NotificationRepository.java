package com.portfolique.repository;

import com.portfolique.entity.Notification;
import com.portfolique.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

  Long countByRecipientAndIsReadFalse(User recipient);

  List<Notification> findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);

  @org.springframework.data.jpa.repository.Modifying
  @org.springframework.data.jpa.repository.Query(
      "UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
  void markAllAsReadForRecipient(
      @org.springframework.data.repository.query.Param("recipientId") Long recipientId);

  void deleteAllByRecipient(User recipient);

  void deleteAllBySender(User sender);
}
