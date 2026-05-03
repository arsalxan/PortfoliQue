package com.portfolique.service;

import com.portfolique.dto.request.UpdateProfileRequest;
import com.portfolique.dto.response.UserProfileResponse;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final PortfolioRepository portfolioRepository;
  private final FeedbackRepository feedbackRepository;
  private final PasswordEncoder passwordEncoder;
  private final CloudinaryService cloudinaryService;

  @Cacheable(value = "userProfiles", key = "#user.id")
  @Transactional(readOnly = true)
  public UserProfileResponse getProfile(User user) {
    long portfolios = portfolioRepository.countByUser(user);
    long feedbacks = feedbackRepository.countByUser(user);

    return UserProfileResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .profilePicture(user.getProfilePicture())
        .role(user.getRole().name())
        .emailVerified(user.isEmailVerified())
        .createdAt(user.getCreatedAt())
        .portfolioCount(portfolios)
        .feedbackCount(feedbacks)
        .build();
  }

  @CacheEvict(value = "userProfiles", key = "#user.id")
  @Transactional
  public UserProfileResponse updateProfile(User user, UpdateProfileRequest req, MultipartFile dp)
      throws IOException {

    // Validate email uniqueness if changing
    if (!user.getEmail().equalsIgnoreCase(req.getEmail())
        && userRepository.existsByEmail(req.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
    }

    // Handle password change
    if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
      if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Current password is required to change password");
      }
      if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
      }
      user.setPassword(passwordEncoder.encode(req.getNewPassword()));
    }

    user.setFullName(req.getFullName());
    user.setEmail(req.getEmail());

    // Handle Profile Picture
    if (dp != null && !dp.isEmpty()) {
      // Delete old if exists
      if (user.getProfilePicture() != null) {
        String publicId = cloudinaryService.extractPublicId(user.getProfilePicture());
        if (publicId != null) {
          cloudinaryService.deleteImage(publicId);
        }
      }
      String dpUrl = cloudinaryService.uploadProfilePicture(dp);
      user.setProfilePicture(dpUrl);
    }

    User saved = userRepository.save(user);
    return getProfile(saved);
  }

  @CacheEvict(
      value = {"userProfiles", "portfolios", "userPortfolios", "portfolioDetails", "feedbacks"},
      allEntries = true)
  @Transactional
  public void deleteAccount(User user) throws IOException {
    // Delete profile picture from Cloudinary if present
    if (user.getProfilePicture() != null) {
      String publicId = cloudinaryService.extractPublicId(user.getProfilePicture());
      if (publicId != null) {
        cloudinaryService.deleteImage(publicId);
      }
    }
    // JPA cascades (User → portfolios, feedbacksGiven, notificationsReceived, notificationsSent)
    // automatically delete all related data in the correct order.
    userRepository.delete(user);
  }
}
