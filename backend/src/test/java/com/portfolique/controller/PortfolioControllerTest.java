package com.portfolique.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.AiReviewRepository;
import com.portfolique.repository.PortfolioRepository;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.CustomUserDetailsService;
import com.portfolique.security.JwtAuthenticationFilter;
import com.portfolique.security.JwtService;
import com.portfolique.security.SecurityConfig;
import com.portfolique.service.AiService;
import com.portfolique.service.AsyncAiReviewService;
import com.portfolique.service.PortfolioAnalyzerService;
import com.portfolique.service.PortfolioService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(PortfolioController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class PortfolioControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private PortfolioService portfolioService;

  @MockitoBean private UserRepository userRepository;

  @MockitoBean private PortfolioAnalyzerService portfolioAnalyzerService;

  @MockitoBean private AiService aiService;

  @MockitoBean private AiReviewRepository aiReviewRepository;

  @MockitoBean private PortfolioRepository portfolioRepository;

  @MockitoBean private AsyncAiReviewService asyncAiReviewService;

  // We also need to mock these to satisfy JwtAuthenticationFilter (and SecurityConfig dependencies)
  @MockitoBean private JwtService jwtService;

  @MockitoBean private CustomUserDetailsService userDetailsService;

  @Test
  void testGetAllPortfolios_OpenAccess() throws Exception {
    PortfolioResponse res = PortfolioResponse.builder().id(1L).url("http://test.com").build();
    when(portfolioService.getAllPortfolios(any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(res)));

    mockMvc
        .perform(get("/api/v1/portfolios"))
        .andDo(print())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].url").value("http://test.com"));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testCreatePortfolio_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    PortfolioRequest req = new PortfolioRequest();
    req.setUrl("http://test.com");
    PortfolioResponse res = PortfolioResponse.builder().id(1L).url("http://test.com").build();

    MockMultipartFile portfolioPart =
        new MockMultipartFile(
            "portfolio", "", "application/json", objectMapper.writeValueAsBytes(req));

    when(portfolioService.createPortfolio(any(), any(), any(User.class))).thenReturn(res);

    mockMvc
        .perform(
            multipart("/api/v1/portfolios")
                .file(portfolioPart)
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.url").value("http://test.com"));
  }

  @Test
  @WithAnonymousUser
  void testCreatePortfolio_Unauthorized() throws Exception {
    PortfolioRequest req = new PortfolioRequest();
    req.setUrl("http://test.com");
    MockMultipartFile portfolioPart =
        new MockMultipartFile(
            "portfolio", "", "application/json", objectMapper.writeValueAsBytes(req));

    mockMvc
        .perform(
            multipart("/api/v1/portfolios")
                .file(portfolioPart)
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testUpdatePortfolio_ForbiddenWhenNotOwner() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    PortfolioRequest req = new PortfolioRequest();
    req.setUrl("http://update.com");
    MockMultipartFile portfolioPart =
        new MockMultipartFile(
            "portfolio", "", "application/json", objectMapper.writeValueAsBytes(req));

    when(portfolioService.updatePortfolio(eq(1L), any(), any(), any(User.class)))
        .thenThrow(
            new ResponseStatusException(
                HttpStatus.FORBIDDEN, "You can only edit your own portfolio"));

    // Put request using multipart requires MockMvcRequestBuilders.multipart with HTTP method PUT
    mockMvc
        .perform(
            multipart(HttpMethod.PUT, "/api/v1/portfolios/1")
                .file(portfolioPart)
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeletePortfolio_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    mockMvc.perform(delete("/api/v1/portfolios/1").with(csrf())).andExpect(status().isNoContent());

    verify(portfolioService).deletePortfolio(eq(1L), any(User.class));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testGetMyPortfolios_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    PortfolioResponse res =
        PortfolioResponse.builder().id(1L).url("http://test.com").userId(1L).build();
    when(portfolioService.getMyPortfolios(any(User.class), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(res)));

    mockMvc
        .perform(get("/api/v1/portfolios/my"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].url").value("http://test.com"))
        .andExpect(jsonPath("$.content[0].userId").value(1L));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeleteReview_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    com.portfolique.entity.Portfolio mockPortfolio =
        com.portfolique.entity.Portfolio.builder().id(10L).user(mockUser).build();
    com.portfolique.entity.AiReview mockReview =
        com.portfolique.entity.AiReview.builder().id(99L).portfolio(mockPortfolio).build();

    when(aiReviewRepository.findById(99L)).thenReturn(Optional.of(mockReview));

    mockMvc
        .perform(delete("/api/v1/portfolios/ai-reviews/99").with(csrf()))
        .andExpect(status().isNoContent());

    verify(aiReviewRepository).delete(mockReview);
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeleteReview_Forbidden() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    User otherUser = User.builder().id(2L).username("other").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    com.portfolique.entity.Portfolio mockPortfolio =
        com.portfolique.entity.Portfolio.builder().id(10L).user(otherUser).build();
    com.portfolique.entity.AiReview mockReview =
        com.portfolique.entity.AiReview.builder().id(99L).portfolio(mockPortfolio).build();

    when(aiReviewRepository.findById(99L)).thenReturn(Optional.of(mockReview));

    mockMvc
        .perform(delete("/api/v1/portfolios/ai-reviews/99").with(csrf()))
        .andExpect(status().isForbidden());

    verify(aiReviewRepository, never()).delete(any());
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeleteReview_NotFound() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    when(aiReviewRepository.findById(99L)).thenReturn(Optional.empty());

    mockMvc
        .perform(delete("/api/v1/portfolios/ai-reviews/99").with(csrf()))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testTriggerAiReview_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    com.portfolique.entity.Portfolio mockPortfolio =
        com.portfolique.entity.Portfolio.builder()
            .id(10L)
            .user(mockUser)
            .url("http://test.com")
            .build();
    when(portfolioRepository.findById(10L)).thenReturn(Optional.of(mockPortfolio));
    when(aiReviewRepository.existsByPortfolio_UserAndCreatedAtAfter(eq(mockUser), any()))
        .thenReturn(false);
    when(aiReviewRepository.findTopByPortfolioOrderByVersionDesc(mockPortfolio))
        .thenReturn(Optional.empty());
    when(aiReviewRepository.countByPortfolio(mockPortfolio)).thenReturn(0);

    com.portfolique.entity.AiReview mockReview =
        com.portfolique.entity.AiReview.builder()
            .id(55L)
            .portfolio(mockPortfolio)
            .version(1)
            .status(com.portfolique.entity.AiReviewStatus.IN_PROGRESS)
            .createdAt(java.time.LocalDateTime.now())
            .build();
    when(aiReviewRepository.save(any())).thenReturn(mockReview);

    mockMvc
        .perform(post("/api/v1/portfolios/10/ai-review/trigger").with(csrf()))
        .andExpect(status().isAccepted())
        .andExpect(jsonPath("$.id").value(55L))
        .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

    verify(asyncAiReviewService).runReviewPipeline(any(), eq("http://test.com"));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testTriggerAiReview_RateLimitExceeded() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    com.portfolique.entity.Portfolio mockPortfolio =
        com.portfolique.entity.Portfolio.builder()
            .id(10L)
            .user(mockUser)
            .url("http://test.com")
            .build();
    when(portfolioRepository.findById(10L)).thenReturn(Optional.of(mockPortfolio));
    when(aiReviewRepository.existsByPortfolio_UserAndCreatedAtAfter(eq(mockUser), any()))
        .thenReturn(true);

    mockMvc
        .perform(post("/api/v1/portfolios/10/ai-review/trigger").with(csrf()))
        .andExpect(status().isTooManyRequests());

    verify(asyncAiReviewService, never()).runReviewPipeline(any(), any());
  }
}
