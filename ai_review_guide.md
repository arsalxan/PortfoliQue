# 🛠️ Implementation Guide - Async Versioned AI Review

A step-by-step, file-level technical guide for implementing the multi-stage, async, fingerprint-cached AI Review system.

---

## PART 1: BACKEND

### Step 1 — Add `AiReviewStatus` Enum

**New File:** `backend/src/main/java/com/portfolique/entity/AiReviewStatus.java`

```java
package com.portfolique.entity;

public enum AiReviewStatus {
    IN_PROGRESS,
    COMPLETED,
    FAILED
}
```

---

### Step 2 — Create the `AiReview` Entity

**New File:** `backend/src/main/java/com/portfolique/entity/AiReview.java`

This entity stores one audit run. Each time a user triggers the AI Review, a new row is created with an incremented `version` number.

```java
@Entity
@Table(name = "ai_reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many reviews can exist for one portfolio (one per version)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    // Incremented per-portfolio. Version 1 is the first, Version 2 is the next run, etc.
    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiReviewStatus status;

    // -- Fingerprints (for cache comparison against previous version) --
    @Column private String jsoupFingerprint;      // SHA-256 of title+links+images
    @Column private String lighthouseFingerprint;  // "perf:{n};acc:{n};seo:{n}"

    // -- Lighthouse raw scores --
    @Column private Integer performanceScore;
    @Column private Integer accessibilityScore;
    @Column private Integer seoScore;

    // -- Gemini text outputs (RETAINED for per-tab display in UI) --
    @Column(columnDefinition = "TEXT") private String jsoupReviewText;
    @Column(columnDefinition = "TEXT") private String lighthouseReviewText;
    @Column(columnDefinition = "TEXT") private String finalReviewText;

    // -- Debugging --
    @Column(columnDefinition = "TEXT") private String errorMessage;

    @CreationTimestamp private LocalDateTime createdAt;
}
```

> Also add the reverse mapping to `Portfolio.java`:
> ```java
> @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
> private List<AiReview> aiReviews = new ArrayList<>();
> ```

---

### Step 3 — Create `AiReviewRepository`

**New File:** `backend/src/main/java/com/portfolique/repository/AiReviewRepository.java`

```java
public interface AiReviewRepository extends JpaRepository<AiReview, Long> {

    // Get the latest completed review for a portfolio (for fingerprint comparison)
    Optional<AiReview> findTopByPortfolioAndStatusOrderByVersionDesc(
        Portfolio portfolio, AiReviewStatus status
    );

    // Get the latest review regardless of status (for checking IN_PROGRESS)
    Optional<AiReview> findTopByPortfolioOrderByVersionDesc(Portfolio portfolio);

    // Get all reviews for a portfolio (for the My Reviews history page), paginated
    Page<AiReview> findByPortfolioOrderByVersionDesc(Portfolio portfolio, Pageable pageable);

    // Used to calculate the next version number
    Integer countByPortfolio(Portfolio portfolio);
}
```

---

### Step 4 — Add `@EnableAsync` to the Application

**Modify:** `PortfoliQueBackendApplication.java`

```java
@SpringBootApplication
@EnableAsync   // <-- Add this
public class PortfoliQueBackendApplication { ... }
```

---

### Step 5 — Create `LighthouseService`

**New File:** `backend/src/main/java/com/portfolique/service/LighthouseService.java`

This service fetches and calculates performance, accessibility, and SEO scores.

**Strategy:** Uses `Jsoup` directly to fetch and analyze the HTML (e.g. `Jsoup.connect(url).get()`), which is the cleanest approach. We do **not** use `RestTemplate` (which is soft-deprecated in Spring Boot) or `WebClient` for HTML scraping, avoiding unnecessary HTTP client layers. `WebClient` is kept as the modern Spring standard if external REST APIs are needed in the future, but it is not used here.

This computes a heuristic score (counting `alt` attributes on images, `<meta>` tags, script-to-stylesheet ratios, etc.) to avoid any external API cost while still providing meaningful relative scores.

```java
@Service
public class LighthouseService {

    public record LighthouseResult(
        int performanceScore,
        int accessibilityScore,
        int seoScore,
        String fingerprint // "perf:{n};acc:{n};seo:{n}"
    ) {}

    public LighthouseResult analyze(String url) {
        try {
            Document doc = Jsoup.connect(url).get();

            // --- SEO: Check for meta description, title, og:tags ---
            int seo = calculateSeoScore(doc);

            // --- Accessibility: Check for alt tags on images, aria labels ---
            int accessibility = calculateAccessibilityScore(doc);

            // --- Performance: Heuristic based on script/stylesheet count, image count ---
            int performance = calculatePerformanceScore(doc);

            String fingerprint = "perf:" + performance + ";acc:" + accessibility + ";seo:" + seo;

            return new LighthouseResult(performance, accessibility, seo, fingerprint);
        } catch (Exception e) {
            // Return default scores on failure — this is a best-effort service
            return new LighthouseResult(50, 50, 50, "perf:50;acc:50;seo:50");
        }
    }

    private int calculateSeoScore(Document doc) { /* count meta tags, title etc. */ }
    private int calculateAccessibilityScore(Document doc) { /* count alt attrs, aria etc. */ }
    private int calculatePerformanceScore(Document doc) { /* count scripts, images etc. */ }
}
```

---

### Step 6 — Update `AiService`

**Modify:** `backend/src/main/java/com/portfolique/service/AiService.java`

Add two new Gemini prompt methods:

```java
// NEW: Generates a Jsoup-based content review
public String generateJsoupReview(PortfolioAnalysis analysis) {
    String prompt = "You are an expert SEO and content reviewer. Analyze the following metadata scraped from a live portfolio website...\n\n"
        + "Title: " + analysis.getTitle() + "\n"
        + "Links: " + truncateLinks(analysis.getLinks()) + "\n"
        + "Images: " + analysis.getImages().size() + " found\n\n"
        + "Provide a detailed content and structural analysis. Focus on clarity, link quality, and page identity. Use markdown.";
    return callGemini(prompt);
}

// NEW: Generates a Lighthouse-metrics-based performance review
public String generateLighthouseReview(LighthouseService.LighthouseResult result) {
    String prompt = "You are a web performance engineer. You have run an automated audit on a portfolio. Here are the scores:\n\n"
        + "Performance: " + result.performanceScore() + "/100\n"
        + "Accessibility: " + result.accessibilityScore() + "/100\n"
        + "SEO: " + result.seoScore() + "/100\n\n"
        + "Explain what each score means, what is likely causing the result, and give 2-3 specific, actionable improvements for each area. Use markdown.";
    return callGemini(prompt);
}

// NEW: Final synthesis combining both reviews
public String synthesizeFinalReview(String jsoupReview, String lighthouseReview) {
    String prompt = "You are a senior web portfolio expert. You have two separate analysis reports for the same developer portfolio. "
        + "Synthesize them into a single cohesive executive summary with an overall verdict and the top 3 priority improvements.\n\n"
        + "--- CONTENT ANALYSIS ---\n" + jsoupReview + "\n\n"
        + "--- PERFORMANCE ANALYSIS ---\n" + lighthouseReview
        + "\n\nOutput only the synthesized markdown report.";
    return callGemini(prompt);
}
```

---

### Step 7 — Create `AsyncAiReviewService`

**New File:** `backend/src/main/java/com/portfolique/service/AsyncAiReviewService.java`

This is the core of the feature — the background pipeline.

```java
@Service
@Slf4j
public class AsyncAiReviewService {

    // Inject: AiReviewRepository, PortfolioAnalyzerService, LighthouseService, AiService

    @Async
    public void runReviewPipeline(AiReview review, String portfolioUrl) {
        try {
            // --- STEP 1: Jsoup Scrape & Fingerprint Cache Check ---
            PortfolioAnalysis analysis = portfolioAnalyzerService.analyzePortfolio(portfolioUrl);
            String newJsoupFingerprint = buildJsoupFingerprint(analysis);

            Optional<AiReview> previousReview = aiReviewRepository
                .findTopByPortfolioAndStatusOrderByVersionDesc(review.getPortfolio(), COMPLETED);

            boolean jsoupCacheHit = previousReview
                .map(p -> p.getJsoupFingerprint().equals(newJsoupFingerprint))
                .orElse(false);

            if (jsoupCacheHit) {
                log.info("[Jsoup Cache HIT] - Reusing review from version {}", previousReview.get().getVersion());
                review.setJsoupReviewText(previousReview.get().getJsoupReviewText());
            } else {
                log.info("[Jsoup Cache MISS] - Calling Gemini for Jsoup review");
                review.setJsoupReviewText(aiService.generateJsoupReview(analysis));
            }
            review.setJsoupFingerprint(newJsoupFingerprint);
            aiReviewRepository.save(review); // Save progress after each step

            // --- STEP 2: Lighthouse Audit & Fingerprint Cache Check ---
            LighthouseResult lhResult = lighthouseService.analyze(portfolioUrl);
            String newLhFingerprint = lhResult.fingerprint();

            boolean lighthouseCacheHit = previousReview
                .map(p -> p.getLighthouseFingerprint().equals(newLhFingerprint))
                .orElse(false);

            if (lighthouseCacheHit) {
                log.info("[Lighthouse Cache HIT] - Reusing review from version {}", previousReview.get().getVersion());
                review.setLighthouseReviewText(previousReview.get().getLighthouseReviewText());
            } else {
                log.info("[Lighthouse Cache MISS] - Calling Gemini for Lighthouse review");
                review.setLighthouseReviewText(aiService.generateLighthouseReview(lhResult));
            }
            review.setLighthouseFingerprint(newLhFingerprint);
            review.setPerformanceScore(lhResult.performanceScore());
            review.setAccessibilityScore(lhResult.accessibilityScore());
            review.setSeoScore(lhResult.seoScore());
            aiReviewRepository.save(review); // Save progress after each step

            // --- STEP 3: Final Synthesis ---
            boolean totalCacheHit = jsoupCacheHit && lighthouseCacheHit;
            if (totalCacheHit) {
                log.info("[Total Cache HIT] - Reusing final review from version {}", previousReview.get().getVersion());
                review.setFinalReviewText(previousReview.get().getFinalReviewText());
            } else {
                log.info("[Synthesis] - Calling Gemini for final synthesis");
                review.setFinalReviewText(aiService.synthesizeFinalReview(
                    review.getJsoupReviewText(), review.getLighthouseReviewText()
                ));
            }

            review.setStatus(AiReviewStatus.COMPLETED);
            aiReviewRepository.save(review);

        } catch (Exception e) {
            log.error("[AI Review Pipeline Failed] ID={}, Error={}", review.getId(), e.getMessage());
            review.setStatus(AiReviewStatus.FAILED);
            review.setErrorMessage(e.getMessage());
            aiReviewRepository.save(review);
        }
    }

    private String buildJsoupFingerprint(PortfolioAnalysis analysis) {
        // SHA-256 of: title + first 20 link hrefs + first 20 image srcs
        String raw = analysis.getTitle()
            + analysis.getLinks().stream().limit(20).map(l -> l.getHref()).collect(joining())
            + analysis.getImages().stream().limit(20).map(i -> i.getSrc()).collect(joining());
        return sha256(raw);
    }
}
```

---

### Step 8 — New API Endpoints in `PortfolioController`

**Modify:** `PortfolioController.java`

Replace the single `GET /{id}/ai-review` endpoint with three:

```java
// 1. Trigger a new async review run (returns 202 immediately)
@PostMapping("/{id}/ai-review/trigger")
public ResponseEntity<AiReviewStatusResponse> triggerAiReview(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails) {

    // Find portfolio, create new AiReview record (version = count + 1),
    // launch asyncAiReviewService.runReviewPipeline() in background,
    // immediately return 202 with the review ID and status=IN_PROGRESS.
}

// 2. Check current status of a specific review by its ID
@GetMapping("/ai-reviews/{reviewId}/status")
public ResponseEntity<AiReviewStatusResponse> getReviewStatus(@PathVariable Long reviewId) {
    // Returns: { id, portfolioId, status, version, createdAt }
    // Polled by the frontend Navbar widget every 10 seconds
}

// 3. Get the full content of a completed review
@GetMapping("/ai-reviews/{reviewId}")
public ResponseEntity<AiReviewFullResponse> getFullReview(@PathVariable Long reviewId) {
    // Returns all text fields + scores.
    // Frontend only calls this when status=COMPLETED.
}

// 4. Get paginated history of all reviews for a given portfolio
@GetMapping("/{id}/ai-reviews/history")
public ResponseEntity<Page<AiReviewHistoryResponse>> getReviewHistory(
        @PathVariable Long id,
        @PageableDefault(size = 5) Pageable pageable) { ... }
```

---

### Step 9 — New DTO classes

**New Files:**
- `AiReviewStatusResponse.java` — `{ id, portfolioId, portfolioUrl, version, status, createdAt }`
- `AiReviewFullResponse.java` — `{ all fields from AiReview entity }`
- `AiReviewHistoryResponse.java` — `{ id, version, status, performanceScore, accessibilityScore, seoScore, createdAt }`

---

## PART 2: FRONTEND

### Step 10 — New TypeScript Types

**Modify:** `frontend/src/types/portfolio.ts`

```typescript
export interface AiReviewStatus {
  id: number;
  portfolioId: number;
  portfolioUrl: string;
  version: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AiReviewFull {
  id: number;
  portfolioId: number;
  version: number;
  status: string;
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  jsoupReviewText: string;
  lighthouseReviewText: string;
  finalReviewText: string;
  errorMessage: string | null;
  createdAt: string;
}

export interface AiReviewHistory {
  id: number;
  version: number;
  status: string;
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  createdAt: string;
}
```

---

### Step 11 — New `aiReviewService.ts`

**New File:** `frontend/src/services/aiReviewService.ts`

```typescript
import api from './api';
import type { AiReviewStatus, AiReviewFull, AiReviewHistory } from '../types/portfolio';

export const aiReviewService = {
  // Trigger a new review for a given portfolio
  triggerReview: async (portfolioId: number): Promise<AiReviewStatus> => {
    const res = await api.post<AiReviewStatus>(`/portfolios/${portfolioId}/ai-review/trigger`);
    return res.data;
  },

  // Poll the status of an in-progress review
  getReviewStatus: async (reviewId: number): Promise<AiReviewStatus> => {
    const res = await api.get<AiReviewStatus>(`/portfolios/ai-reviews/${reviewId}/status`);
    return res.data;
  },

  // Fetch the full review content (only call when COMPLETED)
  getFullReview: async (reviewId: number): Promise<AiReviewFull> => {
    const res = await api.get<AiReviewFull>(`/portfolios/ai-reviews/${reviewId}`);
    return res.data;
  },

  // Paginated history of all reviews for a portfolio
  getReviewHistory: async (portfolioId: number, page = 0, size = 5) => {
    const res = await api.get(`/portfolios/${portfolioId}/ai-reviews/history`, {
      params: { page, size }
    });
    return res.data;
  }
};
```

---

### Step 12 — `AiReviewContext` (Global State for Navbar Status)

**New File:** `frontend/src/context/AiReviewContext.tsx`

This context stores the ID and status of the current user's most recent AI review run. It is polled every 10 seconds in the Navbar.

```typescript
interface AiReviewContextType {
  activeReview: AiReviewStatus | null;        // The latest review for the current user
  setActiveReview: (r: AiReviewStatus) => void; // Called when trigger is hit
}

export const AiReviewProvider = ({ children }) => {
  const [activeReview, setActiveReview] = useState<AiReviewStatus | null>(
    // Persist to localStorage so it survives page refreshes
    JSON.parse(localStorage.getItem('activeAiReview') || 'null')
  );

  // Poll status every 10 seconds if IN_PROGRESS
  useEffect(() => {
    if (!activeReview || activeReview.status !== 'IN_PROGRESS') return;

    const interval = setInterval(async () => {
      const updated = await aiReviewService.getReviewStatus(activeReview.id);
      setActiveReview(updated);
      localStorage.setItem('activeAiReview', JSON.stringify(updated));
      if (updated.status !== 'IN_PROGRESS') clearInterval(interval);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeReview]);
};
```

Wrap `<AiReviewProvider>` inside `App.tsx` alongside `<AuthProvider>`.

---

### Step 13 — `AiReviewStatusWidget` in Navbar

**Modify:** `frontend/src/components/layout/Navbar.tsx`

Add a new nav item just before the notification bell. It reads from `AiReviewContext`:

```tsx
import { useAiReview } from '../../context/AiReviewContext';

const { activeReview } = useAiReview();

// Render logic (inside the nav item list):
{activeReview && (
  <li className="nav-item">
    <Link to={`/portfolios/ai-reviews/${activeReview.id}`} title="AI Audit Status">
      {activeReview.status === 'IN_PROGRESS' && (
        <span className="badge bg-warning text-dark">
          <i className="fas fa-spinner fa-spin me-1"/> AI Audit Running...
        </span>
      )}
      {activeReview.status === 'COMPLETED' && (
        <span className="badge bg-success">
          <i className="fas fa-check-circle me-1"/> AI Audit Ready
        </span>
      )}
      {activeReview.status === 'FAILED' && (
        <span className="badge bg-danger">
          <i className="fas fa-times-circle me-1"/> AI Audit Failed
        </span>
      )}
    </Link>
  </li>
)}
```

---

### Step 14 — Refactor `AiReview.tsx` (The Audit Page)

**Modify:** `frontend/src/pages/portfolio/AiReview.tsx`

This page is no longer opened by clicking "AI Review" on a portfolio. It opens via the Navbar status badge. It uses the `reviewId` from the route param (not the portfolio ID).

**New Route:** `/portfolios/ai-reviews/:reviewId`

**Conditional Rendering based on `status`:**

```tsx
// IN_PROGRESS → renders existing animated scanner UI (no changes needed here)
// FAILED      → renders existing error/unavailable UI
// COMPLETED   → renders the new 3-tab audit dashboard:
//   Tab 1: "Executive Summary"     → finalReviewText (ReactMarkdown)
//   Tab 2: "Content & SEO"         → jsoupReviewText (ReactMarkdown)
//   Tab 3: "Performance"           → lighthouseReviewText (ReactMarkdown) 
//                                   + 3 colored score rings for perf/acc/seo
```

---

### Step 15 — New `MyReviews.tsx` Page

**New File:** `frontend/src/pages/profile/MyReviews.tsx`

A paginated history page per portfolio. Groups reviews by portfolio, showing version cards.

```
My Portfolios
├── Portfolio: "myportfolio.com"
│   ├── [v3] Generated Jun 3  | Perf: 88 | Acc: 95 | SEO: 90 | [View]
│   ├── [v2] Generated May 28 | Perf: 75 | Acc: 88 | SEO: 82 | [View]
│   └── [v1] Generated May 20 | Perf: 60 | Acc: 70 | SEO: 65 | [View]
│   [< 1 2 3 >]
└── Portfolio: "oldportfolio.dev"
    └── [v1] Generated Apr 10 | Perf: 70 | ...
```

**New Route:** `/profile/myreviews` (Protected)

---

### Step 16 — Routing Updates

**Modify:** `frontend/src/App.tsx`

```tsx
// Add the new route:
<Route path="/portfolios/ai-reviews/:reviewId" element={<AiReview />} />
<Route path="/profile/myreviews" element={<MyReviews />} />
```

Also add a "My Reviews" link in the profile dropdown in `Navbar.tsx`.

---

## Summary of New Files

| File | Purpose |
| :--- | :--- |
| `entity/AiReviewStatus.java` | Enum for review lifecycle |
| `entity/AiReview.java` | Database table for one audit run |
| `repository/AiReviewRepository.java` | JPA queries for history and caching |
| `service/LighthouseService.java` | JSoup-based heuristic performance audit |
| `service/AsyncAiReviewService.java` | `@Async` background pipeline |
| `dto/response/AiReviewStatusResponse.java` | Lightweight status DTO |
| `dto/response/AiReviewFullResponse.java` | Full review content DTO |
| `dto/response/AiReviewHistoryResponse.java` | History list DTO |
| `context/AiReviewContext.tsx` | Global React state for Navbar status polling |
| `services/aiReviewService.ts` | API calls for review endpoints |
| `pages/profile/MyReviews.tsx` | Paginated audit history page |
