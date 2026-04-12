package com.portfolique.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.portfolique.dto.request.UpdateProfileRequest;
import com.portfolique.dto.response.UserProfileResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PortfolioRepository portfolioRepository;
  @Mock private FeedbackRepository feedbackRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private CloudinaryService cloudinaryService;

  @InjectMocks private UserService userService;

  private User testUser;

  @BeforeEach
  void setUp() {
    testUser =
        User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .fullName("Test User")
            .password("encodedPassword")
            .role(Role.USER)
            .build();
  }

  @Test
  void testGetProfile() {
    when(portfolioRepository.countByUser(testUser)).thenReturn(5L);
    when(feedbackRepository.countByUser(testUser)).thenReturn(10L);

    UserProfileResponse response = userService.getProfile(testUser);

    assertThat(response.getUsername()).isEqualTo("testuser");
    assertThat(response.getPortfolioCount()).isEqualTo(5L);
    assertThat(response.getFeedbackCount()).isEqualTo(10L);
  }

  @Test
  void testUpdateProfile_PasswordChangeSuccess() throws IOException {
    UpdateProfileRequest req =
        UpdateProfileRequest.builder()
            .fullName("Updated Name")
            .email("test@example.com")
            .currentPassword("oldPassword")
            .newPassword("newPassword")
            .build();

    when(passwordEncoder.matches("oldPassword", "encodedPassword")).thenReturn(true);
    when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
    when(userRepository.save(any())).thenReturn(testUser);

    userService.updateProfile(testUser, req, null);

    assertThat(testUser.getFullName()).isEqualTo("Updated Name");
    assertThat(testUser.getPassword()).isEqualTo("newEncodedPassword");
    verify(userRepository).save(testUser);
  }

  @Test
  void testUpdateProfile_WrongCurrentPassword() {
    UpdateProfileRequest req =
        UpdateProfileRequest.builder()
            .fullName("Updated Name")
            .email("test@example.com")
            .currentPassword("wrongPassword")
            .newPassword("newPassword")
            .build();

    when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

    assertThrows(
        ResponseStatusException.class, () -> userService.updateProfile(testUser, req, null));
  }

  @Test
  void testDeleteAccount() throws IOException {
    userService.deleteAccount(testUser);
    verify(userRepository).delete(testUser);
  }
}
