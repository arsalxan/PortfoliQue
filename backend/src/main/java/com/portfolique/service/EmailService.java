package com.portfolique.service;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class EmailService {

  @Value("${app.brevo.api-key}")
  private String apiKey;

  @Value("${app.brevo.sender-email}")
  private String senderEmail;

  @Value("${app.frontend.url}")
  private String frontendUrl;

  public void sendVerificationEmail(String toEmail, String token) {
    String verificationUrl = frontendUrl + "/verify-email/" + token;
    log.info("Sending verification email to {} with link {}", toEmail, verificationUrl);

    try {
      RestTemplate restTemplate = new RestTemplate();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("api-key", apiKey);
      headers.set("accept", "application/json");

      String htmlContent =
          "<h1>Welcome to PortfoliQue!</h1>"
              + "<p>Please click the link below to verify your email:</p>"
              + "<a href=\""
              + verificationUrl
              + "\">Verify Email</a>";

      Map<String, Object> body =
          Map.of(
              "sender",
              Map.of("email", senderEmail, "name", "PortfoliQue"),
              "to",
              new Object[] {Map.of("email", toEmail)},
              "subject",
              "Verify Your Email for PortfoliQue",
              "htmlContent",
              htmlContent);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
      restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", entity, String.class);
      log.info("Verification email sent successfully to {}", toEmail);
    } catch (Exception e) {
      log.error("Failed to send email to " + toEmail, e);
    }
  }
}
