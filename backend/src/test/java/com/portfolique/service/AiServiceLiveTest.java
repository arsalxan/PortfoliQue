package com.portfolique.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.portfolique.entity.Feedback;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Live test to verify Spring AI OpenAI Compatability via Gemini API. This test only runs if
 * GEMINI_API_KEY is present in the system environment.
 */
@SpringBootTest(properties = "spring.ai.openai.api-key=${GEMINI_API_KEY}")
@EnabledIfEnvironmentVariable(named = "GEMINI_API_KEY", matches = ".*")
public class AiServiceLiveTest {

  @Autowired private AiService aiService;

  @Test
  void testSummarizeFeedbackLive() {
    Feedback f = new Feedback();
    f.setDesign("The design is extremely modern, clean, and uses a great color palette.");
    f.setResponsiveness("Mobile view breaks slightly on smaller devices.");
    f.setContent("Content is well written and gets straight to the point.");
    f.setUxFlow("Navigation is a bit clunky, needs a sticky header.");
    f.setAccessibility("Lots of images missing alt tags, contrast is good.");
    f.setTechnicalPerformance("Page load took about 3 seconds, could be minified.");
    f.setAdditional("Overall a very good portfolio with minor fixes needed.");

    System.out.println("Calling Gemini (via OpenAI compatability) to summarize feedback...");
    String summary = aiService.summarizeFeedback(f);

    System.out.println("\n--- GEMINI OUTPUT ---");
    System.out.println(summary);
    System.out.println("---------------------\n");

    assertNotNull(summary);
    assertFalse(
        summary.contains("Internal error calling AI service:"),
        "We received an internal error instead of generated content: " + summary);
    assertFalse(summary.isEmpty(), "Summary should not be empty");
  }
}
