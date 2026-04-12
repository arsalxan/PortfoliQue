package com.portfolique.repository;

import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class FeedbackRepositoryTest {

    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private PortfolioRepository portfolioRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCountByPortfolio() {
        User user = User.builder()
                .username("test")
                .email("test@test.com")
                .fullName("Test")
                .password("test")
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Portfolio portfolio = Portfolio.builder()
                .url("http://test.com")
                .user(user)
                .build();
        portfolioRepository.save(portfolio);

        Feedback feedback = Feedback.builder()
                .design("Great design")
                .user(user)
                .portfolio(portfolio)
                .build();
        feedbackRepository.save(feedback);

        long count = feedbackRepository.countByPortfolio(portfolio);
        assertThat(count).isEqualTo(1L);
    }
}
