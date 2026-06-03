package com.portfolique.controller;

import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.response.*;
import com.portfolique.entity.*;
import com.portfolique.repository.AiReviewRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.AsyncAiReviewService;
import com.portfolique.service.PortfolioService;
import jakarta.validation.Valid;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

  private final PortfolioService portfolioService;
  private final UserRepository userRepository;
  private final AiReviewRepository aiReviewRepository;
  private final PortfolioRepository portfolioRepository;
  private final AsyncAiReviewService asyncAiReviewService;

  @GetMapping("")
  public ResponseEntity<Page<PortfolioResponse>> getAllPortfolios(
      @PageableDefault(size = 6) Pageable pageable) {
    return ResponseEntity.ok(portfolioService.getAllPortfolios(pageable));
  }

  @GetMapping("/my")
  public ResponseEntity<Page<PortfolioResponse>> getMyPortfolios(
      @AuthenticationPrincipal UserDetails userDetails,
      @PageableDefault(size = 6) Pageable pageable) {
    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.ok(portfolioService.getMyPortfolios(currentUser, pageable));
  }

  @PostMapping("")
  public ResponseEntity<PortfolioResponse> createPortfolio(
      @Valid @RequestPart("portfolio") PortfolioRequest req,
      @RequestPart(value = "screenshot", required = false) MultipartFile screenshot,
      @AuthenticationPrincipal UserDetails userDetails) {

    User currentUser = getCurrentUser(userDetails);
    PortfolioResponse res = portfolioService.createPortfolio(req, screenshot, currentUser);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }

  @PutMapping("/{id}")
  public ResponseEntity<PortfolioResponse> updatePortfolio(
      @PathVariable Long id,
      @Valid @RequestPart("portfolio") PortfolioRequest req,
      @RequestPart(value = "screenshot", required = false) MultipartFile screenshot,
      @AuthenticationPrincipal UserDetails userDetails) {

    User currentUser = getCurrentUser(userDetails);
    return ResponseEntity.ok(portfolioService.updatePortfolio(id, req, screenshot, currentUser));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePortfolio(
      @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {

    User currentUser = getCurrentUser(userDetails);
    portfolioService.deletePortfolio(id, currentUser);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}")
  public ResponseEntity<PortfolioResponse> getPortfolioById(@PathVariable Long id) {
    return ResponseEntity.ok(portfolioService.getPortfolioById(id));
  }

  @GetMapping("/search")
  public ResponseEntity<Page<PortfolioResponse>> searchPortfolios(
      @RequestParam("q") String query, @PageableDefault(size = 6) Pageable pageable) {
    return ResponseEntity.ok(portfolioService.searchPortfolios(query, pageable));
  }

  // 1. Trigger a new async review run (returns 202 immediately)
  @PostMapping("/{id}/ai-review/trigger")
  public ResponseEntity<AiReviewStatusResponse> triggerAiReview(
      @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {

    User currentUser = getCurrentUser(userDetails);
    Portfolio portfolio =
        portfolioRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

    if (!portfolio.getUser().getId().equals(currentUser.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this portfolio");
    }

    // Check if there's already an IN_PROGRESS review for this portfolio to prevent double runs
    Optional<AiReview> latestReviewOpt =
        aiReviewRepository.findTopByPortfolioOrderByVersionDesc(portfolio);
    if (latestReviewOpt.isPresent()
        && latestReviewOpt.get().getStatus() == AiReviewStatus.IN_PROGRESS) {
      AiReview active = latestReviewOpt.get();
      return ResponseEntity.status(HttpStatus.ACCEPTED)
          .body(
              AiReviewStatusResponse.builder()
                  .id(active.getId())
                  .portfolioId(portfolio.getId())
                  .portfolioUrl(portfolio.getUrl())
                  .version(active.getVersion())
                  .status(active.getStatus())
                  .createdAt(active.getCreatedAt())
                  .build());
    }

    // Calculate next version number
    int versionCount = aiReviewRepository.countByPortfolio(portfolio);
    int nextVersion = versionCount + 1;

    // Create the review record with status IN_PROGRESS
    AiReview review =
        AiReview.builder()
            .portfolio(portfolio)
            .version(nextVersion)
            .status(AiReviewStatus.IN_PROGRESS)
            .build();

    review = aiReviewRepository.save(review);

    // Launch pipeline in async executor
    asyncAiReviewService.runReviewPipeline(review, portfolio.getUrl());

    return ResponseEntity.status(HttpStatus.ACCEPTED)
        .body(
            AiReviewStatusResponse.builder()
                .id(review.getId())
                .portfolioId(portfolio.getId())
                .portfolioUrl(portfolio.getUrl())
                .version(review.getVersion())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build());
  }

  // 1b. Get the absolute latest review run by the logged-in user across all portfolios (useful if
  // portfolio got deleted)
  @GetMapping("/ai-reviews/latest")
  public ResponseEntity<AiReviewStatusResponse> getLatestReview(
      @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    Optional<AiReview> activeOpt =
        aiReviewRepository.findTopByPortfolio_UserOrderByCreatedAtDesc(currentUser);

    if (activeOpt.isEmpty()) {
      return ResponseEntity.noContent().build();
    }

    AiReview active = activeOpt.get();
    return ResponseEntity.ok(
        AiReviewStatusResponse.builder()
            .id(active.getId())
            .portfolioId(active.getPortfolio().getId())
            .portfolioUrl(active.getPortfolio().getUrl())
            .version(active.getVersion())
            .status(active.getStatus())
            .createdAt(active.getCreatedAt())
            .build());
  }

  // 2. Check current status of a specific review by its ID
  @GetMapping("/ai-reviews/{reviewId}/status")
  public ResponseEntity<AiReviewStatusResponse> getReviewStatus(@PathVariable Long reviewId) {
    AiReview review =
        aiReviewRepository
            .findById(reviewId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

    return ResponseEntity.ok(
        AiReviewStatusResponse.builder()
            .id(review.getId())
            .portfolioId(review.getPortfolio().getId())
            .portfolioUrl(review.getPortfolio().getUrl())
            .version(review.getVersion())
            .status(review.getStatus())
            .createdAt(review.getCreatedAt())
            .build());
  }

  // 3. Get the full content of a completed review
  @GetMapping("/ai-reviews/{reviewId}")
  public ResponseEntity<AiReviewFullResponse> getFullReview(@PathVariable Long reviewId) {
    AiReview review =
        aiReviewRepository
            .findById(reviewId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

    return ResponseEntity.ok(
        AiReviewFullResponse.builder()
            .id(review.getId())
            .portfolioId(review.getPortfolio().getId())
            .version(review.getVersion())
            .status(review.getStatus())
            .performanceScore(review.getPerformanceScore())
            .accessibilityScore(review.getAccessibilityScore())
            .seoScore(review.getSeoScore())
            .jsoupReviewText(review.getJsoupReviewText())
            .lighthouseReviewText(review.getLighthouseReviewText())
            .finalReviewText(review.getFinalReviewText())
            .errorMessage(review.getErrorMessage())
            .createdAt(review.getCreatedAt())
            .build());
  }

  // 3b. Delete a review
  @DeleteMapping("/ai-reviews/{reviewId}")
  public ResponseEntity<Void> deleteReview(
      @PathVariable Long reviewId, @AuthenticationPrincipal UserDetails userDetails) {
    User currentUser = getCurrentUser(userDetails);
    AiReview review =
        aiReviewRepository
            .findById(reviewId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

    if (!review.getPortfolio().getUser().getId().equals(currentUser.getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "You do not own the portfolio for this review");
    }

    aiReviewRepository.delete(review);
    return ResponseEntity.noContent().build();
  }

  // 4. Get paginated history of all reviews for a given portfolio
  @GetMapping("/{id}/ai-reviews/history")
  public ResponseEntity<Page<AiReviewHistoryResponse>> getReviewHistory(
      @PathVariable Long id, @PageableDefault(size = 5) Pageable pageable) {

    Portfolio portfolio =
        portfolioRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

    Page<AiReview> reviewsPage =
        aiReviewRepository.findByPortfolioOrderByVersionDesc(portfolio, pageable);

    Page<AiReviewHistoryResponse> responsePage =
        reviewsPage.map(
            review ->
                AiReviewHistoryResponse.builder()
                    .id(review.getId())
                    .version(review.getVersion())
                    .status(review.getStatus())
                    .performanceScore(review.getPerformanceScore())
                    .accessibilityScore(review.getAccessibilityScore())
                    .seoScore(review.getSeoScore())
                    .createdAt(review.getCreatedAt())
                    .build());

    return ResponseEntity.ok(responsePage);
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
