package com.portfolique.controller;

import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/portfolios")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    public PortfolioController(PortfolioService portfolioService, UserRepository userRepository) {
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public ResponseEntity<Page<PortfolioResponse>> getAllPortfolios(@PageableDefault(size = 9) Pageable pageable) {
        return ResponseEntity.ok(portfolioService.getAllPortfolios(pageable));
    }

    @PostMapping("/")
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @Valid @RequestPart("portfolio") PortfolioRequest req,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = getCurrentUser(userDetails);
        PortfolioResponse res = portfolioService.createPortfolio(req, screenshot, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable Long id,
            @Valid @RequestPart("portfolio") PortfolioRequest req,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(portfolioService.updatePortfolio(id, req, screenshot, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = getCurrentUser(userDetails);
        portfolioService.deletePortfolio(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getPortfolioById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolioById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PortfolioResponse>> searchPortfolios(
            @RequestParam("q") String query,
            @PageableDefault(size = 9) Pageable pageable) {
        return ResponseEntity.ok(portfolioService.searchPortfolios(query, pageable));
    }

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
