package com.portfolique.repository;

import com.portfolique.entity.Portfolio;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class PortfolioRepositoryTest {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSaveAndSearchPortfolio() {
        User user = User.builder()
                .username("owner")
                .email("owner@gmail.com")
                .fullName("Owner")
                .password("pass")
                .emailVerified(true)
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Portfolio portfolio = Portfolio.builder()
                .url("http://myportfolio.com")
                .description("Awesome java developer")
                .user(user)
                .build();
        portfolioRepository.save(portfolio);

        Page<Portfolio> results = portfolioRepository.searchByDescriptionOrUsername("java", PageRequest.of(0, 10));
        assertThat(results.getTotalElements()).isEqualTo(1);
        assertThat(results.getContent().get(0).getUrl()).isEqualTo("http://myportfolio.com");
    }

    @Test
    public void testSearchByDescriptionOrUsername() {
        User user = User.builder()
                .username("spring_pro")
                .email("spring@test.com")
                .fullName("Spring Pro")
                .password("pass")
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Portfolio p1 = Portfolio.builder()
                .url("http://p1.com")
                .description("Expert in Spring Boot")
                .user(user)
                .build();
        portfolioRepository.save(p1);

        // Search by description (partial, case-insensitive)
        Page<Portfolio> res1 = portfolioRepository.searchByDescriptionOrUsername("BOOT", PageRequest.of(0, 10));
        assertThat(res1.getContent()).hasSize(1);

        // Search by username
        Page<Portfolio> res2 = portfolioRepository.searchByDescriptionOrUsername("spring_pro", PageRequest.of(0, 10));
        assertThat(res2.getContent()).hasSize(1);
    }

    @Test
    public void testFindAllSortedByFewestFeedbacks() {
        User user = User.builder()
                .username("sorter")
                .email("sorter@test.com")
                .fullName("Sorter")
                .password("pass")
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Portfolio p1 = Portfolio.builder().url("p1").user(user).build();
        Portfolio p2 = Portfolio.builder().url("p2").user(user).build();
        portfolioRepository.save(p1);
        portfolioRepository.save(p2);

        // p1 has 0 feedbacks, p2 has 0 feedbacks.
        // Let's add one to p2 later if needed, but for now just check sorting doesn't crash
        Page<Portfolio> res = portfolioRepository.findAllSortedByFewestFeedbacks(PageRequest.of(0, 10));
        assertThat(res.getContent()).hasSize(2);
    }
}
