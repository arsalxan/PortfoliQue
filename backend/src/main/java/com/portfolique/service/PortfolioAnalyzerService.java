package com.portfolique.service;

import lombok.Builder;
import lombok.Data;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioAnalyzerService {

    private final RestTemplate restTemplate;

    public PortfolioAnalyzerService() {
        this.restTemplate = new RestTemplate();
    }

    public PortfolioAnalysis analyzePortfolio(String url) {
        try {
            String html = restTemplate.getForObject(url, String.class);
            if (html == null) {
                return PortfolioAnalysis.builder().error("Failed to fetch HTML content").build();
            }

            Document doc = Jsoup.parse(html);
            
            List<LinkInfo> links = doc.select("a").stream()
                    .map(a -> LinkInfo.builder()
                            .text(a.text())
                            .href(a.attr("abs:href"))
                            .build())
                    .filter(l -> !l.getHref().isEmpty())
                    .limit(50)
                    .collect(Collectors.toList());

            List<ImageInfo> images = doc.select("img").stream()
                    .map(img -> ImageInfo.builder()
                            .alt(img.attr("alt"))
                            .src(img.attr("abs:src"))
                            .build())
                    .filter(i -> !i.getSrc().isEmpty())
                    .limit(50)
                    .collect(Collectors.toList());

            return PortfolioAnalysis.builder()
                    .title(doc.title())
                    .links(links)
                    .images(images)
                    .build();

        } catch (Exception e) {
            return PortfolioAnalysis.builder()
                    .error("Analysis failed: " + e.getMessage())
                    .build();
        }
    }

    @Data
    @Builder
    public static class PortfolioAnalysis {
        private String title;
        private List<LinkInfo> links;
        private List<ImageInfo> images;
        private String error;
    }

    @Data
    @Builder
    public static class LinkInfo {
        private String text;
        private String href;
    }

    @Data
    @Builder
    public static class ImageInfo {
        private String alt;
        private String src;
    }
}
