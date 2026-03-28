package com.portfolique.service;

import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.PortfolioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final CloudinaryService cloudinaryService;

    public PortfolioService(PortfolioRepository portfolioRepository, CloudinaryService cloudinaryService) {
        this.portfolioRepository = portfolioRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional(readOnly = true)
    public Page<PortfolioResponse> getAllPortfolios(Pageable pageable) {
        return portfolioRepository.findAllSortedByFewestFeedbacks(pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public PortfolioResponse createPortfolio(PortfolioRequest req, MultipartFile screenshot, User currentUser) {
        Portfolio portfolio = Portfolio.builder()
                .url(req.getUrl())
                .description(req.getDescription())
                .gitRepo(req.getGitRepo())
                .user(currentUser)
                .build();

        if (screenshot != null && !screenshot.isEmpty()) {
            try {
                String screenshotUrl = cloudinaryService.uploadPortfolioScreenshot(screenshot);
                portfolio.setScreenshot(screenshotUrl);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image to Cloudinary");
            }
        }

        Portfolio saved = portfolioRepository.save(portfolio);
        return mapToResponse(saved);
    }

    @Transactional
    public PortfolioResponse updatePortfolio(Long id, PortfolioRequest req, MultipartFile screenshot, User currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this portfolio");
        }

        portfolio.setUrl(req.getUrl());
        portfolio.setDescription(req.getDescription());
        portfolio.setGitRepo(req.getGitRepo());

        if (screenshot != null && !screenshot.isEmpty()) {
            try {
                // Delete old image if exists
                if (portfolio.getScreenshot() != null) {
                    String publicId = cloudinaryService.extractPublicId(portfolio.getScreenshot());
                    if (publicId != null) {
                        cloudinaryService.deleteImage(publicId);
                    }
                }
                
                String screenshotUrl = cloudinaryService.uploadPortfolioScreenshot(screenshot);
                portfolio.setScreenshot(screenshotUrl);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image to Cloudinary");
            }
        }

        Portfolio saved = portfolioRepository.save(portfolio);
        return mapToResponse(saved);
    }

    @Transactional
    public void deletePortfolio(Long id, User currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this portfolio");
        }

        // Delete screenshot from cloudinary
        if (portfolio.getScreenshot() != null) {
            String publicId = cloudinaryService.extractPublicId(portfolio.getScreenshot());
            if (publicId != null) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (IOException ignored) {}
            }
        }

        portfolioRepository.delete(portfolio);
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioById(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        return mapToResponse(portfolio);
    }

    @Transactional(readOnly = true)
    public Page<PortfolioResponse> searchPortfolios(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return Page.empty(pageable);
        }
        return portfolioRepository.searchByDescriptionOrUsername(query, pageable)
                .map(this::mapToResponse);
    }

    private PortfolioResponse mapToResponse(Portfolio portfolio) {
        return PortfolioResponse.builder()
                .id(portfolio.getId())
                .url(portfolio.getUrl())
                .description(portfolio.getDescription())
                .screenshot(portfolio.getScreenshot())
                .gitRepo(portfolio.getGitRepo())
                .userId(portfolio.getUser().getId())
                .username(portfolio.getUser().getUsername())
                .fullName(portfolio.getUser().getFullName())
                .feedbackCount((long) portfolio.getFeedbacks().size())
                .createdAt(portfolio.getCreatedAt())
                .build();
    }
}
