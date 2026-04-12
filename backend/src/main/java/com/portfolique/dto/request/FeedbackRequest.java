package com.portfolique.dto.request;

import com.portfolique.validation.AtLeastOneFieldValid;
import lombok.Data;

@Data
@AtLeastOneFieldValid
public class FeedbackRequest {
  private String design;
  private String responsiveness;
  private String content;
  private String uxFlow;
  private String accessibility;
  private String technicalPerformance;
  private String additional;
}
