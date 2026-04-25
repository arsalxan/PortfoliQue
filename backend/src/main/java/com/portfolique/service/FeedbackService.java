package com.portfolique.service;

import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FeedbackService {

  private final FeedbackRepository feedbackRepository;
  private final PortfolioRepository portfolioRepository;
  private final NotificationService notificationService;
  private final AiService aiService;

  @Transactional(readOnly = true)
  public Page<FeedbackResponse> getFeedbacksForPortfolio(Long portfolioId, Pageable pageable) {
    Portfolio portfolio =
        portfolioRepository
            .findById(portfolioId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    return feedbackRepository
        .findByPortfolioOrderByCreatedAtDesc(portfolio, pageable)
        .map(this::mapToResponse);
  }

  @Transactional(readOnly = true)
  public Page<FeedbackResponse> getMyFeedbacks(User user, Pageable pageable) {
    return feedbackRepository
        .findByUserOrderByCreatedAtDesc(user, pageable)
        .map(this::mapToResponse);
  }

  @Transactional
  public FeedbackResponse createFeedback(Long portfolioId, FeedbackRequest req, User currentUser) {
    Portfolio portfolio =
        portfolioRepository
            .findById(portfolioId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

    if (portfolio.getUser().getId().equals(currentUser.getId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot review your own portfolio");
    }

    Feedback feedback =
        Feedback.builder()
            .design(req.getDesign())
            .responsiveness(req.getResponsiveness())
            .content(req.getContent())
            .uxFlow(req.getUxFlow())
            .accessibility(req.getAccessibility())
            .technicalPerformance(req.getTechnicalPerformance())
            .additional(req.getAdditional())
            .user(currentUser)
            .portfolio(portfolio)
            .build();

    Feedback saved = feedbackRepository.save(feedback);
    notificationService.createFeedbackNotification(currentUser, portfolio);

    return mapToResponse(saved);
  }

  @Transactional(readOnly = true)
  public FeedbackResponse getFeedbackById(Long feedbackId) {
    Feedback feedback =
        feedbackRepository
            .findById(feedbackId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));
    return mapToResponse(feedback);
  }

  @Transactional(readOnly = true)
  public String summarizeFeedback(Long feedbackId) {
    Feedback feedback =
        feedbackRepository
            .findById(feedbackId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));
    return aiService.summarizeFeedback(feedback);
  }

  @Transactional
  public FeedbackResponse updateFeedback(Long feedbackId, FeedbackRequest req, User currentUser) {
    Feedback feedback =
        feedbackRepository
            .findById(feedbackId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));

    if (!feedback.getUser().getId().equals(currentUser.getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Not authorized to edit this feedback. Only the author can edit.");
    }

    feedback.setDesign(req.getDesign());
    feedback.setResponsiveness(req.getResponsiveness());
    feedback.setContent(req.getContent());
    feedback.setUxFlow(req.getUxFlow());
    feedback.setAccessibility(req.getAccessibility());
    feedback.setTechnicalPerformance(req.getTechnicalPerformance());
    feedback.setAdditional(req.getAdditional());

    Feedback saved = feedbackRepository.save(feedback);
    return mapToResponse(saved);
  }

  @Transactional
  public void deleteFeedback(Long feedbackId, User currentUser) {
    Feedback feedback =
        feedbackRepository
            .findById(feedbackId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));

    // Only the original author may delete their own feedback
    if (!feedback.getUser().getId().equals(currentUser.getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "You do not have permission to delete this feedback. Only the author can delete their own feedback.");
    }

    feedbackRepository.delete(feedback);
  }

  private FeedbackResponse mapToResponse(Feedback feedback) {
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
