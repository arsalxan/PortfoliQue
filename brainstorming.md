# 🧠 PortfoliQue: Brainstorming & Feature Catalog

This document is a living directory of ideas to enhance PortfoliQue. Each idea is labeled with a unique **ID** for easy reference when planning future implementations.

---

## 💼 Category 1: Hiring & Recruiter Features (HR)

### `[ID: HR-01]` "Hire Me" Direct Inquiry
* **Description:** A toggle in the user profile (`Looking for Gigs` / `Looking for Full-Time` / `Closed`). If enabled, a premium "Hire / Inquire" button appears on their portfolio page, opening a modal for recruiters to send project details, budget, and contact info.
* **Why it's valuable:** Connects talent directly to jobs without the friction of a full chat system; sends inquiries directly to the developer's verified email.
* **Complexity:** **Low** (Simple email trigger via Brevo + notification table).

### `[ID: HR-02]` Score-Based Recruiter Filtering
* **Description:** A dedicated recruiter search dashboard where hiring managers can filter candidates using sliders for specific portfolio pillars (e.g., *Show me candidates with Design > 8.0 AND Responsiveness > 8.5*).
* **Why it's valuable:** Allows recruiters to find talent based on objective peer validation rather than resume keyword stuffing.
* **Complexity:** **Medium** (Requires a custom SQL query or JPQL to filter based on aggregated average feedback scores).

### `[ID: HR-03]` Blind Portfolio Mode
* **Description:** A toggle for recruiters to browse portfolios and feedback with all personal identification details (name, photo, gender, location, university) hidden.
* **Why it's valuable:** Helps companies eliminate unconscious bias in hiring and focus purely on design, responsiveness, and peer-reviewed code metrics.
* **Complexity:** **Low** (CSS/React UI toggle that hides personal details in the search results).

### `[ID: HR-04]` "Review Requests" for Job Applications
* **Description:** A job board where companies post roles. Developers apply by submitting their PortfoliQue profile link. The platform automatically sorts applicants on a leaderboard based on their scores relevant to the job description (e.g., designer jobs sort by the *Design* score).
* **Why it's valuable:** Saves recruiters hours of manual scanning by showing a ranked list of verified candidate portfolios.
* **Complexity:** **Medium** (Requires creating a `JobPosting` entity and a join table for applications).

---

## 🤖 Category 2: Review & AI Features (AI)

### `[ID: AI-01]` Google Gemini AI Review Summarizer
* **Description:** A one-click button that triggers Gemini to read all community reviews left on a portfolio and output a concise, structured summary highlighting strengths and areas for improvement.
* **Why it's valuable:** Saves users and recruiters from reading dozens of individual reviews; gives an instant "cliff notes" overview.
* **Complexity:** **Low/Medium** (Already planned/partially integrated via Spring AI).

### `[ID: AI-02]` Automated Lighthouse Audit
* **Description:** When a user submits a portfolio, a background job runs a headless Google Lighthouse audit on their URL, capturing Performance, Accessibility, and SEO metrics.
* **Why it's valuable:** Combines objective machine testing with subjective human reviews for a complete 360-degree assessment.
* **Complexity:** **High** (Requires a backend Node/Java script running Puppeteer/Lighthouse, or an external API).

### `[ID: AI-03]` Gemini AI Tech Coach (Action Items)
* **Description:** Gemini analyzes the automated Lighthouse report and community reviews to produce a step-by-step checklist of specific coding/design fixes (e.g., *"Your accessibility score is low. Since you use Vite, add `vite-plugin-imagemin` to optimize your assets"*).
* **Why it's valuable:** Moves the platform from just pointing out issues to actually helping developers improve their code.
* **Complexity:** **Medium** (Depends on `[ID: AI-02]`, feeding the report JSON into Gemini).

### `[ID: AI-04]` Optional "Roast My Portfolio" Mode (Gemini Roast Bot)
* **Description:** Users can toggle on a "Roast Mode." Gemini reviews the portfolio URL screenshot/text and writes a highly entertaining, witty, and constructive roast of their design decisions.
* **Why it's valuable:** Fun, engaging, and highly shareable on social media, acting as a natural marketing channel.
* **Complexity:** **Medium** (Requires taking a screenshot of the portfolio URL using an API/Puppeteer, then prompting Gemini Vision).

---

## 🎮 Category 3: Gamification & Community (GAME)

### `[ID: GAME-01]` "Proof of Effort" Review Badges
* **Description:** Reward active reviewers with badges (e.g., "Eagle Eye" for writing 10+ reviews, "Accessibility Advocate" for reviews focusing heavily on accessibility).
* **Why it's valuable:** Incentivizes high-quality feedback and keeps the community active.
* **Complexity:** **Low** (Simple backend counters and a `Badge` entity).

### `[ID: GAME-02]` Monthly Leaderboards
* **Description:** Live leaderboards showcasing the **Top Rated Portfolios** and the **Most Helpful Reviewers** of the month.
* **Why it's valuable:** Drives competition and repeat visits as users try to maintain their rank.
* **Complexity:** **Medium** (Requires scheduled cron jobs to calculate monthly score averages and activity metrics).

### `[ID: GAME-03]` "Design vs. Dev" Pairing Space
* **Description:** A collaboration board where designers can share Figma prototypes, and developers can request to code them. Once completed, they link the live site as a collaborative portfolio piece on both profiles.
* **Why it's valuable:** Fosters teamwork and helps both sides build high-quality portfolio pieces together.
* **Complexity:** **Medium** (Requires a simple post/comment board).

---

## 🚀 Category 4: Virality & Growth (VIRAL)

### `[ID: VIRAL-01]` Embeddable Skill Badges
* **Description:** A dynamic SVG badge that users can copy-paste into their actual portfolio website (e.g., *"Top 10% Accessibility Rating on PortfoliQue"*). Clicking the badge redirects back to their review page.
* **Why it's valuable:** Direct organic growth engine. Every user's personal website becomes a billboard for PortfoliQue.
* **Complexity:** **Medium** (Requires an endpoint that generates dynamic SVG images based on database scores).

### `[ID: VIRAL-02]` "Share My Review" Cards
* **Description:** A beautiful, shareable PNG card showing a radar chart of the user's score pillars along with a quote from a top reviewer, ready to post on LinkedIn/Twitter.
* **Why it's valuable:** Makes it easy for users to brag about their high ratings, driving social traffic.
* **Complexity:** **Medium** (Requires frontend HTML-to-image conversion or canvas rendering).

### `[ID: VIRAL-03]` GitHub Pinned Repository Badge Generator
* **Description:** Allow users to export their PortfoliQue rating card as a markdown badge to display on their GitHub profile Readme.
* **Why it's valuable:** Tap into the GitHub community, placing PortfoliQue directly where developers showcase their profiles.
* **Complexity:** **Low** (Uses the same SVG generator as `[ID: VIRAL-01]`).

---

## ⚙️ Category 5: Technical Architecture & UX Polish (TECH)

### `[ID: TECH-01]` WebSocket Live Notifications
* **Description:** Shift review notifications and comments to WebSockets (using STOMP/SockJS or Socket.io) so users see feedback roll in live without reloading.
* **Why it's valuable:** Creates a high-fidelity, "live" feel that keeps users hooked on the page.
* **Complexity:** **Medium/High** (Requires backend WebSocket configuration and frontend state subscription).

### `[ID: TECH-02]` Interactive Radar (Spider) Charts
* **Description:** Replace text scores with an interactive SVG Radar Chart visualizing the 6 pillars (Design, Responsiveness, Content, UX Flow, Accessibility, Technical Performance).
* **Why it's valuable:** Gives a beautiful, premium visual signature to the profile reviews.
* **Complexity:** **Low/Medium** (Can be implemented easily using Chart.js or Recharts).

### `[ID: TECH-03]` Social Sign-In (OAuth2)
* **Description:** Implement one-click registration and sign-in using GitHub, Google, and LinkedIn.
* **Why it's valuable:** Lowers sign-up friction significantly, which is critical for community growth.
* **Complexity:** **Medium** (Spring Security OAuth2 client setup + frontend redirects).
