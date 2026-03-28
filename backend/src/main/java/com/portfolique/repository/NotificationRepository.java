package com.portfolique.repository;

import com.portfolique.entity.Notification;
import com.portfolique.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    Long countByRecipientAndIsReadFalse(User recipient);
    List<Notification> findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
}
