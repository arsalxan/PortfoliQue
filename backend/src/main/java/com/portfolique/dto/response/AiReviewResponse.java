package com.portfolique.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiReviewResponse {
    private Long portfolioId;
    private String portfolioUrl;
    private String pageTitle;
    private int linkCount;
    private int imageCount;
    private String review;
}
