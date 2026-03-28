package com.portfolique.service;

import com.portfolique.entity.Feedback;
import com.portfolique.service.PortfolioAnalyzerService.PortfolioAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final WebClient geminiWebClient;

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String modelName;

    public String generatePortfolioReview(PortfolioAnalysis analysis) {
        String prompt = "You are an expert web developer and designer profile reviewer. " +
                "Analyze the following data extracted from the user's portfolio URL:\n\n" +
                "**Page Title:** " + (analysis.getTitle() == null ? "None" : analysis.getTitle()) + "\n" +
                "**Links found:** " + (analysis.getLinks() == null ? 0 : analysis.getLinks().size()) + "\n" +
                "**Images found:** " + (analysis.getImages() == null ? 0 : analysis.getImages().size()) + "\n\n" +
                "Example of links: " + truncateLinks(analysis.getLinks()) + "\n\n" +
                "Provide a comprehensive review including overall impression, page title analysis, " +
                "link analysis, image analysis, and specific suggestions for improvement. Use markdown formatting.";

        return callGemini(prompt);
    }

    public String summarizeFeedback(Feedback feedback) {
        String prompt = "Summarize the following feedback for a web portfolio into exactly 3 short bullet points:\n\n" +
                "Design: " + feedback.getDesign() + "\n" +
                "Responsiveness: " + feedback.getResponsiveness() + "\n" +
                "Content: " + feedback.getContent() + "\n" +
                "UX/Flow: " + feedback.getUxFlow() + "\n" +
                "Accessibility: " + feedback.getAccessibility() + "\n" +
                "Performance: " + feedback.getTechnicalPerformance() + "\n" +
                "Additional: " + feedback.getAdditional();

        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            Map response = geminiWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + modelName + ":generateContent")
                            .queryParam("key", geminiApiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    Map part = (Map) parts.get(0);
                    return (String) part.get("text");
                }
            }
            return "AI failed to generate a response.";
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return "Internal error calling AI service: " + e.getMessage();
        }
    }

    private String truncateLinks(List<PortfolioAnalyzerService.LinkInfo> links) {
        if (links == null || links.isEmpty()) return "[]";
        return links.stream()
                .limit(5)
                .map(l -> l.getText() + " (" + l.getHref() + ")")
                .collect(java.util.stream.Collectors.joining(", ", "[", "...]"));
    }
}
