package com.portfolique.service;

import com.portfolique.dto.request.PortfolioRequest;
import com.portfolique.dto.response.PortfolioResponse;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import com.portfolique.repository.PortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PortfolioServiceTest {

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private PortfolioService portfolioService;

    private User testUser;
    private Portfolio testPortfolio;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
        testPortfolio = Portfolio.builder()
                .id(1L)
                .url("http://test.com")
                .user(testUser)
                .build();
    }

    @Test
    void testGetAllPortfolios() {
        Page<Portfolio> page = new PageImpl<>(List.of(testPortfolio));
        when(portfolioRepository.findAllSortedByFewestFeedbacks(any())).thenReturn(page);

        Page<PortfolioResponse> result = portfolioService.getAllPortfolios(PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUrl()).isEqualTo("http://test.com");
    }

    @Test
    void testCreatePortfolio() throws IOException {
        PortfolioRequest req = new PortfolioRequest();
        req.setUrl("http://new.com");
        MockMultipartFile file = new MockMultipartFile("screenshot", "test.png", "image/png", "content".getBytes());

        when(cloudinaryService.uploadPortfolioScreenshot(any())).thenReturn("http://cloudinary.com/img.png");
        when(portfolioRepository.save(any())).thenReturn(testPortfolio);

        PortfolioResponse response = portfolioService.createPortfolio(req, file, testUser);

        assertThat(response).isNotNull();
        verify(cloudinaryService).uploadPortfolioScreenshot(any());
        verify(portfolioRepository).save(any());
    }

    @Test
    void testUpdatePortfolio_Forbidden() {
        User otherUser = User.builder().id(2L).username("other").build();
        PortfolioRequest req = new PortfolioRequest();

        when(portfolioRepository.findById(1L)).thenReturn(Optional.of(testPortfolio));

        assertThrows(ResponseStatusException.class, () -> 
            portfolioService.updatePortfolio(1L, req, null, otherUser)
        );
    }
}
