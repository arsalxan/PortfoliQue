package com.portfolique.controller;

import com.portfolique.dto.response.AdminDashboardResponse;
import com.portfolique.dto.response.UserResponse;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.portfolique.security.JwtService;
import com.portfolique.security.CustomUserDetailsService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.portfolique.security.SecurityConfig;
import com.portfolique.security.JwtAuthenticationFilter;

@WebMvcTest(AdminController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc(addFilters = true)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardStats() throws Exception {
        AdminDashboardResponse stats = AdminDashboardResponse.builder()
                .totalUsers(5L).totalPortfolios(10L).totalFeedbacks(20L).build();
        when(adminService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(5))
                .andExpect(jsonPath("$.totalPortfolios").value(10))
                .andExpect(jsonPath("$.totalFeedbacks").value(20));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUsers() throws Exception {
        UserResponse user = UserResponse.builder().id(1L).username("testuser").build();
        Page<UserResponse> page = new PageImpl<>(List.of(user));
        when(adminService.getUsers(eq("test"), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/users")
                .param("search", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("testuser"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDeleteUser() throws Exception {
        User adminUser = User.builder().id(1L).username("admin").role(com.portfolique.entity.Role.ADMIN).build();
        when(userRepository.findByUsername("admin")).thenReturn(java.util.Optional.of(adminUser));

        mockMvc.perform(delete("/api/v1/admin/users/2")
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(adminService).deleteUser(2L, 1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeletePortfolio() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/portfolios/1")
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(adminService).deletePortfolio(1L);
    }

    @Test
    @org.springframework.security.test.context.support.WithAnonymousUser
    void testAdminAccessAnonymous() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andDo(print())
                .andExpect(status().isForbidden()); 
    }

    @Test
    @WithMockUser(roles = "USER")
    void testAdminAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
}
