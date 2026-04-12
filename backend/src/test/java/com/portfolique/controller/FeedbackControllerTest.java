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
import com.portfolique.dto.request.FeedbackRequest;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.CustomUserDetailsService;
import com.portfolique.security.JwtAuthenticationFilter;
import com.portfolique.security.JwtService;
import com.portfolique.security.SecurityConfig;
import com.portfolique.service.AiService;
import com.portfolique.service.FeedbackService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(FeedbackController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class FeedbackControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private FeedbackService feedbackService;

  @MockitoBean private UserRepository userRepository;

  @MockitoBean private AiService aiService;

  // Security constraints
  @MockitoBean private JwtService jwtService;

  @MockitoBean private CustomUserDetailsService userDetailsService;

  @Test
  void testGetFeedbacksForPortfolio_OpenAccess() throws Exception {
    FeedbackResponse res = FeedbackResponse.builder().id(1L).design("Great design").build();
    when(feedbackService.getFeedbacksForPortfolio(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(res)));

    mockMvc
        .perform(get("/api/v1/portfolios/1/feedbacks"))
        .andDo(print())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].design").value("Great design"));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testCreateFeedback_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    FeedbackRequest req = new FeedbackRequest();
    req.setDesign("This design looks absolutely fantastic and I love it!");

    FeedbackResponse res =
        FeedbackResponse.builder()
            .id(1L)
            .design("This design looks absolutely fantastic and I love it!")
            .build();

    when(feedbackService.createFeedback(eq(1L), any(), any(User.class))).thenReturn(res);

    mockMvc
        .perform(
            post("/api/v1/portfolios/1/feedbacks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(
            jsonPath("$.design").value("This design looks absolutely fantastic and I love it!"));
  }

  @Test
  @WithAnonymousUser
  void testCreateFeedback_Unauthorized() throws Exception {
    FeedbackRequest req = new FeedbackRequest();
    req.setDesign("This design looks absolutely fantastic and I love it!");

    mockMvc
        .perform(
            post("/api/v1/portfolios/1/feedbacks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testCreateFeedback_CannotFeedbackOwnPortfolio() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    FeedbackRequest req = new FeedbackRequest();
    req.setDesign("This design looks absolutely fantastic and I love it!");

    when(feedbackService.createFeedback(eq(1L), any(), any(User.class)))
        .thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Cannot feedback your own portfolio"));

    mockMvc
        .perform(
            post("/api/v1/portfolios/1/feedbacks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void testGetFeedbackById_OpenAccess() throws Exception {
    FeedbackResponse res = FeedbackResponse.builder().id(1L).design("Good").build();
    when(feedbackService.getFeedbackById(1L)).thenReturn(res);

    mockMvc
        .perform(get("/api/v1/feedbacks/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.design").value("Good"));
  }

  @Test
  void testSummarizeFeedback_OpenAccess() throws Exception {
    when(feedbackService.summarizeFeedback(1L)).thenReturn("A short summary");

    mockMvc
        .perform(get("/api/v1/feedbacks/1/summarize"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary").value("A short summary"));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeleteFeedback_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    mockMvc.perform(delete("/api/v1/feedbacks/1").with(csrf())).andExpect(status().isNoContent());

    verify(feedbackService).deleteFeedback(eq(1L), any(User.class));
  }

  @Test
  @WithMockUser(username = "hacker", roles = "USER")
  void testDeleteFeedback_ForbiddenWhenNotOwner() throws Exception {
    User mockUser = User.builder().id(2L).username("hacker").role(Role.USER).build();
    when(userRepository.findByUsername("hacker")).thenReturn(Optional.of(mockUser));

    doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized"))
        .when(feedbackService)
        .deleteFeedback(eq(1L), any(User.class));

    mockMvc.perform(delete("/api/v1/feedbacks/1").with(csrf())).andExpect(status().isForbidden());
  }
}
