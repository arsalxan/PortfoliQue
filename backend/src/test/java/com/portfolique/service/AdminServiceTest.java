package com.portfolique.service;

import com.portfolique.dto.response.AdminDashboardResponse;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.dto.response.UserResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.FeedbackRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @InjectMocks
    private AdminService adminService;

    private User admin;
    private User user;
    private Portfolio portfolio;
    private Feedback feedback;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).username("admin").role(Role.ADMIN).build();
        user = User.builder().id(2L).username("user").fullName("Test User").role(Role.USER).build();
        portfolio = Portfolio.builder().id(1L).description("Test").user(user).feedbacks(Collections.emptyList()).build();
        feedback = Feedback.builder().id(1L).design("Great").user(user).portfolio(portfolio).build();
    }

    @Test
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(5L);
        when(portfolioRepository.count()).thenReturn(10L);
        when(feedbackRepository.count()).thenReturn(20L);

        AdminDashboardResponse stats = adminService.getDashboardStats();

        assertThat(stats.getTotalUsers()).isEqualTo(5L);
        assertThat(stats.getTotalPortfolios()).isEqualTo(10L);
        assertThat(stats.getTotalFeedbacks()).isEqualTo(20L);
    }

    @Test
    void testGetUsers_Recent() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(user));
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        Page<UserResponse> result = adminService.getUsers(null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUsername()).isEqualTo(user.getUsername());
    }

    @Test
    void testGetUsers_Search() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(user));
        when(userRepository.findByUsernameContainingIgnoreCase("user", pageable)).thenReturn(userPage);

        Page<UserResponse> result = adminService.getUsers("user", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(userRepository).findByUsernameContainingIgnoreCase("user", pageable);
    }

    @Test
    void testDeleteUser_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        adminService.deleteUser(2L, 1L);

        verify(userRepository).delete(user);
    }

    @Test
    void testDeleteUser_SelfDeleteError() {
        assertThatThrownBy(() -> adminService.deleteUser(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot delete your own account");
    }

    @Test
    void testGetPortfolios_Search() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Portfolio> portfolioPage = new PageImpl<>(List.of(portfolio));
        when(portfolioRepository.findByUser_UsernameContainingIgnoreCase("user", pageable)).thenReturn(portfolioPage);

        Page<PortfolioResponse> result = adminService.getPortfolios("user", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(portfolioRepository).findByUser_UsernameContainingIgnoreCase("user", pageable);
    }

    @Test
    void testGetFeedbacks_Filters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Feedback> feedbackPage = new PageImpl<>(List.of(feedback));
        when(feedbackRepository.searchByFilters(anyString(), anyString(), any(Pageable.class))).thenReturn(feedbackPage);

        Page<FeedbackResponse> result = adminService.getFeedbacks("user", "design", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(feedbackRepository).searchByFilters(eq("user"), eq("design"), eq(pageable));
    }

    @Test
    void testDeletePortfolio_Success() {
        when(portfolioRepository.findById(1L)).thenReturn(Optional.of(portfolio));

        adminService.deletePortfolio(1L);

        verify(portfolioRepository).delete(portfolio);
    }
}
