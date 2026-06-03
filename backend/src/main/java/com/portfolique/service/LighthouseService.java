package com.portfolique.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class LighthouseService {

  public record LighthouseResult(
      int performanceScore, int accessibilityScore, int seoScore, String fingerprint) {}

  public LighthouseResult analyze(String url) {
    try {
      Document doc =
          Jsoup.connect(url)
              .userAgent(
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
              .timeout(15000)
              .get();

      int seo = calculateSeoScore(doc);
      int accessibility = calculateAccessibilityScore(doc);
      int performance = calculatePerformanceScore(doc);

      String fingerprint = "perf:" + performance + ";acc:" + accessibility + ";seo:" + seo;

      return new LighthouseResult(performance, accessibility, seo, fingerprint);
    } catch (Exception e) {
      // Safe fallback defaults on network/scraping failures
      return new LighthouseResult(50, 50, 50, "perf:50;acc:50;seo:50");
    }
  }

  private int calculateSeoScore(Document doc) {
    int score = 100;

    // Check <title> tag
    String title = doc.title();
    if (title.isEmpty() || title.length() < 5) {
      score -= 20;
    }

    // Check meta description
    Elements metaDesc = doc.select("meta[name=description]");
    if (metaDesc.isEmpty() || metaDesc.attr("content").trim().isEmpty()) {
      score -= 30;
    }

    // Check h1 existence
    Elements h1 = doc.select("h1");
    if (h1.isEmpty()) {
      score -= 20;
    } else if (h1.size() > 1) {
      // SEO recommends only 1 h1 tag
      score -= 10;
    }

    // Check viewport tag for responsiveness
    Elements viewport = doc.select("meta[name=viewport]");
    if (viewport.isEmpty()) {
      score -= 20;
    }

    return Math.max(10, score);
  }

  private int calculateAccessibilityScore(Document doc) {
    int score = 100;

    // Check alt tags on images
    Elements images = doc.select("img");
    if (!images.isEmpty()) {
      long missingAlt =
          images.stream()
              .filter(img -> !img.hasAttr("alt") || img.attr("alt").trim().isEmpty())
              .count();
      if (missingAlt > 0) {
        double ratio = (double) missingAlt / images.size();
        score -= (int) (ratio * 40);
      }
    }

    // Check language tag on HTML root
    String lang = doc.select("html").attr("lang");
    if (lang.isEmpty()) {
      score -= 20;
    }

    // Check for descriptive links (avoid "click here", "read more")
    Elements links = doc.select("a");
    if (!links.isEmpty()) {
      long badLinks =
          links.stream()
              .map(a -> a.text().toLowerCase().trim())
              .filter(
                  t ->
                      t.equals("click here")
                          || t.equals("here")
                          || t.equals("read more")
                          || t.equals("more")
                          || t.equals("learn more"))
              .count();
      if (badLinks > 0) {
        score -= Math.min(20, badLinks * 5);
      }
    }

    // Check header tag ordering (h1, h2, h3, etc.) - simple check
    Elements headers = doc.select("h1, h2, h3, h4, h5, h6");
    if (headers.isEmpty()) {
      score -= 10;
    }

    return Math.max(10, score);
  }

  private int calculatePerformanceScore(Document doc) {
    int score = 100;

    // Number of scripts (too many blocking scripts reduce performance)
    Elements scripts = doc.select("script[src]");
    if (scripts.size() > 8) {
      score -= Math.min(20, (scripts.size() - 8) * 3);
    }

    // Number of CSS files (blocking resources)
    Elements stylesheets = doc.select("link[rel=stylesheet]");
    if (stylesheets.size() > 5) {
      score -= Math.min(15, (stylesheets.size() - 5) * 3);
    }

    // Large amount of images without lazy loading
    Elements images = doc.select("img");
    if (!images.isEmpty()) {
      long missingLazy =
          images.stream()
              .filter(img -> !img.hasAttr("loading") || !img.attr("loading").equals("lazy"))
              .count();
      if (missingLazy > 3) {
        score -= Math.min(15, (missingLazy - 3) * 2);
      }
    }

    // Total DOM size proxy
    int domElements = doc.getAllElements().size();
    if (domElements > 1500) {
      score -= 25;
    } else if (domElements > 800) {
      score -= 15;
    }

    // Check if compression/inline CSS is used
    Elements inlineStyles = doc.select("style");
    if (inlineStyles.isEmpty() && stylesheets.size() == 0) {
      score -= 10; // no styles at all is weird, but keep it performant
    }

    return Math.max(10, score);
  }
}
