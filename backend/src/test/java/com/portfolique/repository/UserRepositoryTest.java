package com.portfolique.repository;

import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSaveAndFindByUsername() {
        User user = User.builder()
                .username("testuser")
                .email("test@gmail.com")
                .fullName("Test User")
                .password("password123")
                .emailVerified(true)
                .role(Role.USER)
                .build();

        userRepository.save(user);

        Optional<User> found = userRepository.findByUsername("testuser");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@gmail.com");
    }

    @Test
    public void testDeleteExpiredUnverifiedUsers() {
        User unverifiedUser = User.builder()
                .username("unverified")
                .email("unverified@gmail.com")
                .fullName("Unverified")
                .password("pass")
                .emailVerified(false)
                .emailVerificationTokenExpires(LocalDateTime.now().minusHours(2))
                .role(Role.USER)
                .build();

        userRepository.save(unverifiedUser);

        userRepository.deleteByEmailVerifiedFalseAndEmailVerificationTokenExpiresBefore(LocalDateTime.now());

        Optional<User> found = userRepository.findByUsername("unverified");
        assertThat(found).isEmpty();
    }
}
