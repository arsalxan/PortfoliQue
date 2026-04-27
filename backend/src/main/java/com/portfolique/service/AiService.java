package com.portfolique.service;

import com.portfolique.entity.Feedback;
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
      log.error("Spring AI Gemini Error: {}", e.getMessage());
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
