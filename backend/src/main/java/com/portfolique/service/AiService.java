package com.portfolique.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.portfolique.entity.Feedback;
import com.portfolique.service.PortfolioAnalyzerService.PortfolioAnalysis;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AiService {

    private final Client client;

    public AiService(@Value("${app.gemini.api-key}") String apiKey) {
        // Using the EXACT client initialization pattern requested by the user
        // although we inject the key from properties for Spring compatibility.
        this.client = new Client.Builder()
                .apiKey(apiKey)
                .build();
    }

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
            // Using the EXACT generation pattern requested by the user
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-3-flash-preview",
                    prompt,
                    null
            );

            return response.text();
        } catch (Exception e) {
            log.error("Google GenAI Error: {}", e.getMessage());
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
