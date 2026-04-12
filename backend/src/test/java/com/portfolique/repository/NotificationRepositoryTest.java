package com.portfolique.repository;

import com.portfolique.entity.Notification;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;


import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    public void testFindUnread() {
        User user = User.builder()
                .username("recipient")
                .email("rec@test.com")
                .fullName("Rec")
                .password("passwd")
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Notification notification = Notification.builder()
                .recipient(user)
                .type("new_comment")
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        List<Notification> unread = notificationRepository.findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
        assertThat(unread).hasSize(1);
        assertThat(unread.get(0).getType()).isEqualTo("new_comment");
    }
}
