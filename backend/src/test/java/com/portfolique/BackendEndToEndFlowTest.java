package com.portfolique;

import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.request.LoginRequest;
import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
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
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.ai.openai.api-key=dummy-test-key")
@Transactional // Ensures clean DB rollback after the test runs
public class BackendEndToEndFlowTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // We mock EmailService to prevent actual emails from being sent to Brevo API during the test
    @MockitoBean
    private EmailService emailService;

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
        List<Notification> initialNotifications = notificationRepository.findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(userA);
        assertTrue(initialNotifications.isEmpty(), "User A should have zero notifications at this point");

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
        List<Feedback> storedFeedbacks = feedbackRepository.findByPortfolioOrderByCreatedAtDesc(savedPortfolio, org.springframework.data.domain.Pageable.unpaged()).getContent();
        assertEquals(1, storedFeedbacks.size(), "Portfolio should have exactly 1 feedback");
        assertEquals("e2e_reviewer", storedFeedbacks.get(0).getUser().getUsername());

        // 7. Verify Notification is created specifically for User A regarding the Feedback
        List<Notification> finalNotifications = notificationRepository.findTop5ByRecipientAndIsReadFalseOrderByCreatedAtDesc(userA);
        assertFalse(finalNotifications.isEmpty(), "Notification should have been automatically generated for User A");
        assertEquals(1, finalNotifications.size(), "User A should have exactly 1 notification");
        
        Notification notification = finalNotifications.get(0);
        assertEquals("new_comment", notification.getType());
        assertFalse(notification.isRead(), "Notification should be unread initially");
        
        System.out.println("-> Notification successfully verified for User A!");
        System.out.println("=== END TO END FLOW TEST COMPLETED SUCCESSFULLY ===");
    }
}
