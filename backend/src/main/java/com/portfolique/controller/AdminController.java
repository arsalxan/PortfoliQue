package com.portfolique.controller;

import com.portfolique.dto.response.AdminDashboardResponse;
import com.portfolique.dto.response.FeedbackResponse;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.dto.response.UserResponse;
import com.portfolique.entity.User;
import com.portfolique.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getUsers(search, pageable));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        adminService.deleteUser(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/portfolios")
    public ResponseEntity<Page<PortfolioResponse>> getPortfolios(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getPortfolios(search, pageable));
    }

    @DeleteMapping("/portfolios/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        adminService.deletePortfolio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<Page<FeedbackResponse>> getFeedbacks(
            @RequestParam(required = false) String givenBy,
            @RequestParam(required = false) String content,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getFeedbacks(givenBy, content, pageable));
    }

    @DeleteMapping("/feedbacks/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        adminService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
