package com.portfolique.controller;

import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.FeedbackService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FeedbackController {

  private final FeedbackService feedbackService;
  private final UserRepository userRepository;
  private final com.portfolique.service.AiService aiService;

  @GetMapping("/portfolios/{id}/feedbacks")
  public ResponseEntity<Page<FeedbackResponse>> getFeedbacksForPortfolio(
      @PathVariable Long id, @PageableDefault(size = 10) Pageable pageable) {
    return ResponseEntity.ok(feedbackService.getFeedbacksForPortfolio(id, pageable));
  }

  @PostMapping("/portfolios/{id}/feedbacks")
  public ResponseEntity<FeedbackResponse> createFeedback(
      @PathVariable Long id,
      @Valid @RequestBody FeedbackRequest req,
      @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(feedbackService.createFeedback(id, req, currentUser));
  }

  @GetMapping("/feedbacks/{feedbackId}")
  public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long feedbackId) {
    return ResponseEntity.ok(feedbackService.getFeedbackById(feedbackId));
  }

  @GetMapping("/feedbacks/{feedbackId}/summarize")
  public ResponseEntity<Map<String, String>> summarizeFeedback(@PathVariable Long feedbackId) {
    String summary = feedbackService.summarizeFeedback(feedbackId);
    return ResponseEntity.ok(Map.of("summary", summary));
  }

  @PutMapping("/feedbacks/{feedbackId}")
  public ResponseEntity<FeedbackResponse> updateFeedback(
      @PathVariable Long feedbackId,
      @Valid @RequestBody FeedbackRequest req,
      @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.ok(feedbackService.updateFeedback(feedbackId, req, currentUser));
  }

  @DeleteMapping("/feedbacks/{feedbackId}")
  public ResponseEntity<Void> deleteFeedback(
      @PathVariable Long feedbackId, @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    feedbackService.deleteFeedback(feedbackId, currentUser);
    return ResponseEntity.noContent().build();
  }

  private User getCurrentUser(UserDetails userDetails) {
    if (userDetails == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
    }
    return userRepository
        .findByUsername(userDetails.getUsername())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }
}
