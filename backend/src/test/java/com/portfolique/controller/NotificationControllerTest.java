package com.portfolique.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolique.dto.response.NotificationResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.JwtAuthenticationFilter;
import com.portfolique.security.SecurityConfig;
import com.portfolique.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private UserRepository userRepository;

    // Security constraints mock dependencies
    @MockitoBean
    private com.portfolique.security.JwtService jwtService;
    
    @MockitoBean
    private com.portfolique.security.CustomUserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testGetNotifications_Success() throws Exception {
        User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        NotificationResponse res = NotificationResponse.builder().id(1L).type("FEEDBACK").build();
        when(notificationService.getNotificationsForUser(any(User.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(res)));

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("FEEDBACK"));
    }

    @Test
    @WithAnonymousUser
    void testGetNotifications_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testGetUnreadCount_Success() throws Exception {
        User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        when(notificationService.getUnreadCount(any(User.class))).thenReturn(5L);

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testGetUnreadPreview_Success() throws Exception {
        User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        NotificationResponse res = NotificationResponse.builder().id(1L).type("FEEDBACK").build();
        when(notificationService.getUnreadPreview(any(User.class))).thenReturn(List.of(res));

        mockMvc.perform(get("/api/v1/notifications/unread-preview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("FEEDBACK"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testMarkAllAsRead_Success() throws Exception {
        User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(put("/api/v1/notifications/mark-all-read")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(notificationService).markAllAsRead(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testMarkAsRead_Success() throws Exception {
        User mockUser = User.builder().id(1L).username("testuser").role(Role.USER).build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(put("/api/v1/notifications/1/read")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(notificationService).markAsRead(org.mockito.ArgumentMatchers.eq(1L), any(User.class));
    }
}
