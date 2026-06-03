package com.portfolique.exception;

/**
 * Thrown by AiService when the Gemini API returns a 429 / RESOURCE_EXHAUSTED response. This is an
 * internal signal only — callers log it at WARN level and surface a generic user-friendly message;
 * the raw API error is never exposed to the client.
 */
public class AiRateLimitException extends RuntimeException {

  public AiRateLimitException(Throwable cause) {
    super(cause);
  }
}
