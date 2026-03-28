package com.portfolique.repository;

import com.portfolique.entity.Portfolio;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
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
}
