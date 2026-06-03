package com.portfolique.service;

import com.portfolique.entity.AiReview;
import com.portfolique.entity.AiReviewStatus;
import com.portfolique.exception.AiRateLimitException;
import com.portfolique.repository.AiReviewRepository;
import com.portfolique.service.LighthouseService.LighthouseResult;
import com.portfolique.service.PortfolioAnalyzerService.PortfolioAnalysis;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncAiReviewService {

  private final AiReviewRepository aiReviewRepository;
  private final PortfolioAnalyzerService portfolioAnalyzerService;
  private final LighthouseService lighthouseService;
  private final AiService aiService;

  @Async
  public void runReviewPipeline(AiReview review, String portfolioUrl) {
    try {
      log.info(
          "Starting Async AI review pipeline for Review ID: {}, URL: {}",
          review.getId(),
          portfolioUrl);

      // --- STEP 1: Jsoup Scrape & Fingerprint Cache Check ---
      PortfolioAnalysis analysis = portfolioAnalyzerService.analyzePortfolio(portfolioUrl);
      if (analysis.getError() != null) {
        throw new RuntimeException("HTML Scraping failed: " + analysis.getError());
      }

      String newJsoupFingerprint = buildJsoupFingerprint(analysis);
      Optional<AiReview> previousReview =
          aiReviewRepository.findTopByPortfolioAndStatusOrderByVersionDesc(
              review.getPortfolio(), AiReviewStatus.COMPLETED);

      boolean jsoupCacheHit =
          previousReview
              .map(p -> newJsoupFingerprint.equals(p.getJsoupFingerprint()))
              .orElse(false);

      if (jsoupCacheHit) {
        log.info(
            "[Jsoup Cache HIT] - Reusing review from version {}",
            previousReview.get().getVersion());
        review.setJsoupReviewText(previousReview.get().getJsoupReviewText());
      } else {
        log.info("[Jsoup Cache MISS] - Calling Gemini for Jsoup content review");
        review.setJsoupReviewText(aiService.generateJsoupReview(analysis));
      }
      review.setJsoupFingerprint(newJsoupFingerprint);
      aiReviewRepository.save(review); // Save step 1 progress

      // --- STEP 2: Lighthouse Heuristics & Fingerprint Cache Check ---
      LighthouseResult lhResult = lighthouseService.analyze(portfolioUrl);
      String newLhFingerprint = lhResult.fingerprint();

      boolean lighthouseCacheHit =
          previousReview
              .map(p -> newLhFingerprint.equals(p.getLighthouseFingerprint()))
              .orElse(false);

      if (lighthouseCacheHit) {
        log.info(
            "[Lighthouse Cache HIT] - Reusing review from version {}",
            previousReview.get().getVersion());
        review.setLighthouseReviewText(previousReview.get().getLighthouseReviewText());
      } else {
        log.info("[Lighthouse Cache MISS] - Calling Gemini for Lighthouse metrics review");
        review.setLighthouseReviewText(aiService.generateLighthouseReview(lhResult));
      }
      review.setLighthouseFingerprint(newLhFingerprint);
      review.setPerformanceScore(lhResult.performanceScore());
      review.setAccessibilityScore(lhResult.accessibilityScore());
      review.setSeoScore(lhResult.seoScore());
      aiReviewRepository.save(review); // Save step 2 progress

      // --- STEP 3: Final Synthesis ---
      boolean totalCacheHit = jsoupCacheHit && lighthouseCacheHit;
      if (totalCacheHit) {
        log.info(
            "[Total Cache HIT] - Reusing final summary from version {}",
            previousReview.get().getVersion());
        review.setFinalReviewText(previousReview.get().getFinalReviewText());
      } else {
        log.info("[Synthesis] - Calling Gemini for final synthesis");
        review.setFinalReviewText(
            aiService.synthesizeFinalReview(
                review.getJsoupReviewText(), review.getLighthouseReviewText()));
      }

      review.setStatus(AiReviewStatus.COMPLETED);
      aiReviewRepository.save(review);
      log.info("Async AI review pipeline successfully COMPLETED for Review ID: {}", review.getId());

    } catch (AiRateLimitException e) {
      // Quota / rate-limit: logged at WARN only — not alarming, not user-visible
      log.warn("[AI Review Pipeline] Rate limit hit for Review ID={}", review.getId());
      review.setStatus(AiReviewStatus.FAILED);
      review.setErrorMessage("AI review could not be generated. Please try again later.");
      aiReviewRepository.save(review);
    } catch (Exception e) {
      log.error("[AI Review Pipeline Failed] ID={}, Error={}", review.getId(), e.getMessage(), e);
      review.setStatus(AiReviewStatus.FAILED);
      review.setErrorMessage("AI review could not be generated. Please try again later.");
      aiReviewRepository.save(review);
    }
  }

  private String buildJsoupFingerprint(PortfolioAnalysis analysis) {
    String title = analysis.getTitle() == null ? "" : analysis.getTitle();
    String linksStr =
        analysis.getLinks() == null
            ? ""
            : analysis.getLinks().stream()
                .limit(20)
                .map(PortfolioAnalyzerService.LinkInfo::getHref)
                .collect(Collectors.joining());
    String imagesStr =
        analysis.getImages() == null
            ? ""
            : analysis.getImages().stream()
                .limit(20)
                .map(PortfolioAnalyzerService.ImageInfo::getSrc)
                .collect(Collectors.joining());

    String raw = title + "|" + linksStr + "|" + imagesStr;
    return sha256(raw);
  }

  private String sha256(String base) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
      StringBuilder hexString = new StringBuilder();
      for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) hexString.append('0');
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (NoSuchAlgorithmException ex) {
      throw new RuntimeException("SHA-256 not available", ex);
    }
  }
}
