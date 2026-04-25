package com.portfolique.service;

import com.portfolique.dto.response.AdminDashboardResponse;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.dto.response.UserResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final PortfolioRepository portfolioRepository;
  private final FeedbackRepository feedbackRepository;

  public AdminDashboardResponse getDashboardStats() {
    return AdminDashboardResponse.builder()
        .totalUsers(userRepository.count())
        .totalPortfolios(portfolioRepository.count())
        .totalFeedbacks(feedbackRepository.count())
        .build();
  }

  public Page<UserResponse> getUsers(String search, Pageable pageable) {
    Page<User> users;
    if (search == null || search.trim().isEmpty()) {
      users = userRepository.findAll(pageable);
    } else {
      users = userRepository.findByUsernameContainingIgnoreCase(search, pageable);
    }
    return users.map(this::mapToUserResponse);
  }

  @Transactional
  public void deleteUser(Long userId, Long currentAdminId) {
    if (userId.equals(currentAdminId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete your own account");
    }
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    userRepository.delete(user);
  }

  public Page<PortfolioResponse> getPortfolios(String search, Pageable pageable) {
    Page<Portfolio> portfolios;
    if (search == null || search.trim().isEmpty()) {
      portfolios = portfolioRepository.findAll(pageable);
    } else {
      portfolios = portfolioRepository.findByUser_UsernameContainingIgnoreCase(search, pageable);
    }
    return portfolios.map(this::mapToPortfolioResponse);
  }

  @Transactional
  public void deletePortfolio(Long portfolioId) {
    Portfolio portfolio =
        portfolioRepository
            .findById(portfolioId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    portfolioRepository.delete(portfolio);
  }

  public Page<FeedbackResponse> getFeedbacks(String givenBy, String content, Pageable pageable) {
    Page<Feedback> feedbacks = feedbackRepository.searchByFilters(givenBy, content, pageable);
    return feedbacks.map(this::mapToFeedbackResponse);
  }

  @Transactional
  public void deleteFeedback(Long feedbackId) {
    Feedback feedback =
        feedbackRepository
            .findById(feedbackId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));
    feedbackRepository.delete(feedback);
  }

  private UserResponse mapToUserResponse(User user) {
    return UserResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .profilePicture(user.getProfilePicture())
        .role(user.getRole().name())
        .emailVerified(user.isEmailVerified())
        .createdAt(user.getCreatedAt())
        .build();
  }

  private PortfolioResponse mapToPortfolioResponse(Portfolio portfolio) {
    return PortfolioResponse.builder()
        .id(portfolio.getId())
        .description(portfolio.getDescription())
        .url(portfolio.getUrl())
        .screenshot(portfolio.getScreenshot())
        .userId(portfolio.getUser().getId())
        .username(portfolio.getUser().getUsername())
        .fullName(portfolio.getUser().getFullName())
        .feedbackCount((long) portfolio.getFeedbacks().size())
        .createdAt(portfolio.getCreatedAt())
        .build();
  }

  private FeedbackResponse mapToFeedbackResponse(Feedback feedback) {
    return FeedbackResponse.builder()
        .id(feedback.getId())
        .design(feedback.getDesign())
        .responsiveness(feedback.getResponsiveness())
        .content(feedback.getContent())
        .uxFlow(feedback.getUxFlow())
        .accessibility(feedback.getAccessibility())
        .technicalPerformance(feedback.getTechnicalPerformance())
        .additional(feedback.getAdditional())
        .userId(feedback.getUser().getId())
        .username(feedback.getUser().getUsername())
        .fullName(feedback.getUser().getFullName())
        .portfolioId(feedback.getPortfolio().getId())
        .portfolioOwnerUsername(feedback.getPortfolio().getUser().getUsername())
        .portfolioOwnerFullName(feedback.getPortfolio().getUser().getFullName())
        .createdAt(feedback.getCreatedAt())
        .build();
  }
}
