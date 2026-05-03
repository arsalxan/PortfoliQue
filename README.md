# 🚀 PortfoliQue

**PortfoliQue** is a premium, full-stack community platform designed for developers and designers to get structured, actionable feedback on their portfolios. It leverages AI to summarize community thoughts and ensures a high-performance experience with intelligent caching and modern UX patterns.

---

## ✨ Key Features

### 👨‍💻 For Users
- **Structured Feedback:** Give and receive reviews based on 6 critical pillars: Design, Responsiveness, Content, UX Flow, Accessibility, and Technical Performance.
- **AI-Powered Summaries:** One-click AI summarization of community feedback using **Google Gemini**.
- **Modern UX:** High-end **Skeleton Loaders** for a seamless, "instant" feel during data fetching.
- **Real-time Notifications:** Stay updated when someone reviews your work.
- **Profile Management:** Fully customizable profiles with Cloudinary-backed avatars.

### 🛡️ For Admins
- **Global Moderation:** Full control over users, portfolios, and feedbacks.
- **Data Integrity:** Intelligent JPA cascading ensures that deleting a user cleanly removes all associated data, leaving zero "ghost" records.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework:** Java 17/23 with Spring Boot 3.4
- **Database:** PostgreSQL (Relational)
- **Security:** Spring Security with JWT Authentication
- **Caching:** Spring Cache with Redis integration
- **AI:** Spring AI (Google Gemini integration)
- **Media:** Cloudinary (Image hosting)
- **Email:** Brevo (Transactional emails & verification)

### **Frontend**
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Modern Custom Properties)
- **State Management:** React Hooks & Context API
- **Notifications:** React Hot Toast

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Redis (Optional, but recommended for caching)

### 1. Backend Setup
```bash
cd backend
# Create a .env file based on the environment variables section below
mvn spring-boot:run
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following:

```properties
# Database
DB_URL=jdbc:postgresql://localhost:5432/portfolique
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=86400000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Brevo (Email)
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=your_verified_email

# Google Gemini (via Spring AI)
GEMINI_API_KEY=your_gemini_key

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 📂 Project Structure

```text
PortfoliQue/
├── backend/            # Spring Boot Application
│   ├── src/main/java/  # Core logic, Entities, Services
│   └── src/test/       # Unit & Integration Tests
├── frontend/           # React Application
│   ├── src/components/ # Reusable UI & Skeleton components
│   ├── src/pages/      # Feature-specific pages
│   └── src/styles/     # Global & Module CSS
└── future_aspects.md   # Project Roadmap & Vision
```

---

## 🛤️ Roadmap
For the future vision and upcoming features of PortfoliQue, check out [future_aspects.md](./future_aspects.md).

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
