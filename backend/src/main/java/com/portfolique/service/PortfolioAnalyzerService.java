package com.portfolique.service;

import java.util.List;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAnalyzerService {

  public PortfolioAnalyzerService() {}

  public PortfolioAnalysis analyzePortfolio(String url) {
    try {
      // Connect directly using Jsoup, resolving the URL to set absolute paths accurately
      Document doc =
          Jsoup.connect(url)
              .userAgent(
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
              .timeout(15000)
              .get();

      List<LinkInfo> links =
          doc.select("a").stream()
              .map(a -> LinkInfo.builder().text(a.text()).href(a.attr("abs:href")).build())
              .filter(l -> !l.getHref().isEmpty())
              .limit(50)
              .collect(Collectors.toList());

      List<ImageInfo> images =
          doc.select("img").stream()
              .map(img -> ImageInfo.builder().alt(img.attr("alt")).src(img.attr("abs:src")).build())
              .filter(i -> !i.getSrc().isEmpty())
              .limit(50)
              .collect(Collectors.toList());

      return PortfolioAnalysis.builder().title(doc.title()).links(links).images(images).build();

    } catch (Exception e) {
      return PortfolioAnalysis.builder().error("Analysis failed: " + e.getMessage()).build();
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
