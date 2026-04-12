package com.portfolique.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolique.dto.request.UpdateProfileRequest;
import com.portfolique.dto.response.UserProfileResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.CustomUserDetailsService;
import com.portfolique.security.JwtAuthenticationFilter;
import com.portfolique.security.JwtService;
import com.portfolique.security.SecurityConfig;
import com.portfolique.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class UserControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private UserService userService;
  @MockitoBean private UserRepository userRepository;
  @MockitoBean private JwtService jwtService;
  @MockitoBean private CustomUserDetailsService userDetailsService;

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testGetProfile_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    UserProfileResponse res =
        UserProfileResponse.builder().username("testuser").portfolioCount(5).build();
    when(userService.getProfile(any(User.class))).thenReturn(res);

    mockMvc
        .perform(get("/api/v1/users/profile"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("testuser"))
        .andExpect(jsonPath("$.portfolioCount").value(5));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testUpdateProfile_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    UpdateProfileRequest req =
        UpdateProfileRequest.builder().fullName("New Name").email("new@example.com").build();
    MockMultipartFile profilePart =
        new MockMultipartFile(
            "profile", "", "application/json", objectMapper.writeValueAsBytes(req));

    UserProfileResponse res = UserProfileResponse.builder().fullName("New Name").build();
    when(userService.updateProfile(any(), any(), any())).thenReturn(res);

    mockMvc
        .perform(
            multipart(HttpMethod.PUT, "/api/v1/users/profile")
                .file(profilePart)
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.fullName").value("New Name"));
  }

  @Test
  @WithMockUser(username = "testuser", roles = "USER")
  void testDeleteAccount_Success() throws Exception {
    User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    mockMvc.perform(delete("/api/v1/users/profile").with(csrf())).andExpect(status().isNoContent());

    verify(userService).deleteAccount(any(User.class));
  }
}
