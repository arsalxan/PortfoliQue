package com.portfolique;

import static org.junit.jupiter.api.Assertions.*;

import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Notification;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.NotificationRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.AuthService;
import com.portfolique.service.EmailService;
import com.portfolique.service.FeedbackService;
import com.portfolique.service.PortfolioService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "spring.ai.openai.api-key=dummy-test-key")
@Transactional // Ensures clean DB rollback after the test runs
public class BackendEndToEndFlowTest {

  @Autowired private AuthService authService;

  @Autowired private PortfolioService portfolioService;

  @Autowired private FeedbackService feedbackService;

  @Autowired private UserRepository userRepository;

  @Autowired private PortfolioRepository portfolioRepository;

  @Autowired private FeedbackRepository feedbackRepository;

  @Autowired private NotificationRepository notificationRepository;

  // We mock EmailService to prevent actual emails from being sent to Brevo API during the test
  @MockitoBean private EmailService emailService;

  @Test
  public void testBackendEntitiesE2EFlow() {
    System.out.println("=== STARTING END TO END FLOW TEST ===");

    // 1. Create and Verify User A (Portfolio Owner)
    RegisterRequest registerReqA = new RegisterRequest();
    registerReqA.setUsername("e2e_owner");
    registerReqA.setEmail("e2e_owner@gmail.com");
    registerReqA.setPassword("TestPass123!");
    registerReqA.setFullName("E2E Owner");
    authService.register(registerReqA);

    User userA = userRepository.findByUsername("e2e_owner").orElseThrow();
    assertFalse(userA.isEmailVerified(), "User should initially be unverified");

    AuthResponse verifyResA = authService.verifyEmail(userA.getEmailVerificationToken());
    assertTrue(verifyResA.getMessage().contains("verified successfully"));
    System.out.println("-> User A (Owner) Created and Verified!");

    // 2. Create and Verify User B (Reviewer)
    RegisterRequest registerReqB = new RegisterRequest();
    registerReqB.setUsername("e2e_reviewer");
    registerReqB.setEmail("e2e_reviewer@gmail.com");
    registerReqB.setPassword("TestPass123!");
    registerReqB.setFullName("E2E Reviewer");
    authService.register(registerReqB);

    User userB = userRepository.findByUsername("e2e_reviewer").orElseThrow();
    authService.verifyEmail(userB.getEmailVerificationToken());
    userB = userRepository.findByUsername("e2e_reviewer").orElseThrow();
    System.out.println("-> User B (Reviewer) Created and Verified!");

    // 3. User A creates a Portfolio
    PortfolioRequest portfolioReq = new PortfolioRequest();
    portfolioReq.setUrl("https://e2e-portfolio.com");
    portfolioReq.setDescription("This is an end-to-end test portfolio description testing.");
    portfolioReq.setGitRepo("https://github.com/e2e/repo");

    PortfolioResponse portfolioRes = portfolioService.createPortfolio(portfolioReq, null, userA);
    assertNotNull(portfolioRes.getId(), "Portfolio ID must be generated");
    assertEquals("https://e2e-portfolio.com", portfolioRes.getUrl());
    System.out.println("-> Portfolio created by User A!");

    // 4. Double check NO notifications exist yet for User A
    List<Notification> initialNotifications =
        notificationRepository.findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(userA);
    assertTrue(
        initialNotifications.isEmpty(), "User A should have zero notifications at this point");

    // 5. User B leaves Feedback on User A's Portfolio
    FeedbackRequest feedbackReq = new FeedbackRequest();
    feedbackReq.setDesign("Great simplistic modern design!");
    feedbackReq.setResponsiveness("Works fine on my mobile test.");
    feedbackReq.setContent("Accurate grammar and presentation.");
    feedbackReq.setUxFlow("Very intuitive navigation headers.");
    feedbackReq.setAccessibility("Could use some more ARIA labels.");
    feedbackReq.setTechnicalPerformance("Loaded very fast on local test.");
    feedbackReq.setAdditional("Keep up the great work.");

    feedbackService.createFeedback(portfolioRes.getId(), feedbackReq, userB);
    System.out.println("-> Feedback created by User B on User A's Portfolio!");

    // 6. Verify Feedback is in the repository
    Portfolio savedPortfolio = portfolioRepository.findById(portfolioRes.getId()).orElseThrow();
    List<Feedback> storedFeedbacks =
        feedbackRepository
            .findByPortfolioOrderByCreatedAtDesc(
                savedPortfolio, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
    assertEquals(1, storedFeedbacks.size(), "Portfolio should have exactly 1 feedback");
    assertEquals("e2e_reviewer", storedFeedbacks.get(0).getUser().getUsername());

    // 7. Verify Notification is created specifically for User A regarding the Feedback
    List<Notification> finalNotifications =
        notificationRepository.findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(userA);
    assertFalse(
        finalNotifications.isEmpty(),
        "Notification should have been automatically generated for User A");
    assertEquals(1, finalNotifications.size(), "User A should have exactly 1 notification");

    Notification notification = finalNotifications.get(0);
    assertEquals("new_comment", notification.getType());
    assertFalse(notification.isRead(), "Notification should be unread initially");

    System.out.println("-> Notification successfully verified for User A!");

    // 8. Security/RBAC Check: Ensure only User B can edit their feedback
    RegisterRequest registerReqC = new RegisterRequest();
    registerReqC.setUsername("e2e_random");
    registerReqC.setEmail("e2e_random@gmail.com");
    registerReqC.setPassword("TestPass123!");
    registerReqC.setFullName("E2E Random User");
    authService.register(registerReqC);
    User userC = userRepository.findByUsername("e2e_random").orElseThrow();

    Long targetFeedbackId = storedFeedbacks.get(0).getId();
    FeedbackRequest updateReq = new FeedbackRequest();
    updateReq.setContent("Tampered content");

    // User C (Random) tries to edit User B's feedback -> Should Fail
    org.springframework.web.server.ResponseStatusException ex1 =
        assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> feedbackService.updateFeedback(targetFeedbackId, updateReq, userC));
    assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, ex1.getStatusCode());

    // User A (Portfolio Owner) tries to edit User B's feedback -> Should Fail
    org.springframework.web.server.ResponseStatusException ex2 =
        assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> feedbackService.updateFeedback(targetFeedbackId, updateReq, userA));
    assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, ex2.getStatusCode());

    // User B (Author) tries to edit THEIR OWN feedback -> Should Succeed
    updateReq.setContent("Legitimate Update by Author!");
    FeedbackResponse updatedRes =
        feedbackService.updateFeedback(targetFeedbackId, updateReq, userB);
    assertEquals("Legitimate Update by Author!", updatedRes.getContent());
    System.out.println("-> RBAC Update Security verified! Only authors can edit.");

    System.out.println("=== END TO END FLOW TEST COMPLETED SUCCESSFULLY ===");
  }
}
