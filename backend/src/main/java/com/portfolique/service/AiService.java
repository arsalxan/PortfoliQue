package com.portfolique.service;

import com.portfolique.entity.Feedback;
import com.portfolique.exception.AiRateLimitException;
import com.portfolique.service.PortfolioAnalyzerService.PortfolioAnalysis;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AiService {

  private final ChatClient chatClient;

  public AiService(ChatModel chatModel) {
    this.chatClient = ChatClient.builder(chatModel).build();
  }

  public String generateJsoupReview(PortfolioAnalysis analysis) {
    String prompt =
        "You are an expert SEO and content reviewer. Analyze the following metadata scraped from a live portfolio website:\n\n"
            + "Title: "
            + (analysis.getTitle() == null ? "None" : analysis.getTitle())
            + "\n"
            + "Links: "
            + truncateLinks(analysis.getLinks())
            + "\n"
            + "Images count: "
            + (analysis.getImages() == null ? 0 : analysis.getImages().size())
            + "\n\n"
            + "Provide a detailed content and structural analysis. Focus on clarity, copy/wording, links quality, and page identity. Use markdown headers, bold text, and bullet points. Output ONLY the markdown content. Do not add conversational intro/outro text.";
    return callGemini(prompt);
  }

  public String generateLighthouseReview(LighthouseService.LighthouseResult result) {
    String prompt =
        "You are a web performance engineer. You have run an automated performance audit on a portfolio page. Here are the scores (out of 100):\n\n"
            + "Performance: "
            + result.performanceScore()
            + "/100\n"
            + "Accessibility: "
            + result.accessibilityScore()
            + "/100\n"
            + "SEO: "
            + result.seoScore()
            + "/100\n\n"
            + "Explain what each score means based on standard Google Lighthouse metrics, what is likely causing the result, and give 2-3 specific, actionable improvements for each area. Use markdown headers and bullet points. Output ONLY the markdown content. Do not add conversational intro/outro text.";
    return callGemini(prompt);
  }

  public String synthesizeFinalReview(String jsoupReview, String lighthouseReview) {
    String prompt =
        "You are a senior web developer, hiring manager, and portfolio reviewer. You have two separate analysis reports for a developer portfolio page:\n\n"
            + "--- CONTENT & STRUCTURE ANALYSIS ---\n"
            + jsoupReview
            + "\n\n"
            + "--- METRICS & PERFORMANCE ANALYSIS ---\n"
            + lighthouseReview
            + "\n\n"
            + "Synthesize these two reviews into a single cohesive overall summary. Provide:\n"
            + "1. A concise Executive Summary verdict of the portfolio (strengths & weaknesses)\n"
            + "2. Top 3 priority improvements that will make the user stand out to recruiters and load faster.\n\n"
            + "Format with professional markdown. Output ONLY the synthesized markdown report. Do not add conversational intro/outro text.";
    return callGemini(prompt);
  }

  public String generatePortfolioReview(PortfolioAnalysis analysis) {
    String prompt =
        "You are an expert web developer and designer profile reviewer. "
            + "Analyze the following data extracted from the user's portfolio URL:\n\n"
            + "**Page Title:** "
            + (analysis.getTitle() == null ? "None" : analysis.getTitle())
            + "\n"
            + "**Links found:** "
            + (analysis.getLinks() == null ? 0 : analysis.getLinks().size())
            + "\n"
            + "**Images found:** "
            + (analysis.getImages() == null ? 0 : analysis.getImages().size())
            + "\n\n"
            + "Example of links: "
            + truncateLinks(analysis.getLinks())
            + "\n\n"
            + "Provide a comprehensive review including overall impression, page title analysis, "
            + "link analysis, image analysis, and specific suggestions for improvement. Use markdown formatting. "
            + "Provide ONLY the review content. Do NOT include any introductory or concluding remarks like 'Here is the review' or 'I hope this helps'.";

    return callGemini(prompt);
  }

  public String summarizeFeedback(Feedback feedback) {
    String prompt =
        "Summarize the following feedback for a web portfolio into exactly 3 short bullet points. "
            + "Provide ONLY the bullet points. DO NOT include any introductory or concluding text like 'Here is the summary' or 'The summary is as follows':\n\n"
            + "Design: "
            + feedback.getDesign()
            + "\n"
            + "Responsiveness: "
            + feedback.getResponsiveness()
            + "\n"
            + "Content: "
            + feedback.getContent()
            + "\n"
            + "UX/Flow: "
            + feedback.getUxFlow()
            + "\n"
            + "Accessibility: "
            + feedback.getAccessibility()
            + "\n"
            + "Performance: "
            + feedback.getTechnicalPerformance()
            + "\n"
            + "Additional: "
            + feedback.getAdditional();

    return callGemini(prompt);
  }

  private String callGemini(String prompt) {
    try {
      return chatClient.prompt().user(prompt).call().content();
    } catch (Exception e) {
      String message = e.getMessage();
      if (message != null && (message.contains("RESOURCE_EXHAUSTED") || message.contains("429"))) {
        log.warn("[Gemini] Rate limit / quota exceeded: {}", message);
        throw new AiRateLimitException(e);
      }
      log.error("[Gemini] Unexpected API error: {}", message, e);
      throw e;
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
