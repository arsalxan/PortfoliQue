import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';

// Pages
import Home from './pages/Home.tsx';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import VerifyEmail from './pages/auth/VerifyEmail.tsx';

// Portfolio Pages
import PortfolioList from './pages/portfolio/PortfolioList.tsx';
import PortfolioCreate from './pages/portfolio/PortfolioCreate.tsx';
import PortfolioEdit from './pages/portfolio/PortfolioEdit.tsx';
import PortfolioSearch from './pages/portfolio/PortfolioSearch.tsx';

// Feedback Pages
import FeedbackList from './pages/feedback/FeedbackList.tsx';
import FeedbackCreate from './pages/feedback/FeedbackCreate.tsx';
import FeedbackDetail from './pages/feedback/FeedbackDetail.tsx';

// Dashboard Page
import Dashboard from './pages/Dashboard.tsx';

// Placeholder components for pages not yet built
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container mt-5 text-center">
      <h2 className="text-primary">{title}</h2>
      <p className="text-secondary">This page is under construction.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Portfolio routes (browsing is public, creating requires auth) */}
            <Route path="/portfolios" element={<PortfolioList />} />
            <Route path="/portfolios/search" element={<PortfolioSearch />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/portfolios/new" element={<PortfolioCreate />} />
              <Route path="/portfolios/:id/edit" element={<PortfolioEdit />} />
              <Route path="/portfolios/:id/feedbacks" element={<FeedbackList />} />
              <Route path="/portfolios/:id/feedbacks/new" element={<FeedbackCreate />} />
              <Route path="/portfolios/:portfolioId/feedbacks/:feedbackId" element={<FeedbackDetail />} />
              <Route path="/portfolios/:id/ai-review" element={<PlaceholderPage title="AI Review" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
              <Route path="/profile/myportfolios" element={<PlaceholderPage title="My Portfolios" />} />
              <Route path="/profile/myfeedbacks" element={<PlaceholderPage title="My Feedbacks" />} />
              <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
              <Route path="/admin/users" element={<PlaceholderPage title="Manage Users" />} />
              <Route path="/admin/portfolios" element={<PlaceholderPage title="Manage Portfolios" />} />
              <Route path="/admin/feedbacks" element={<PlaceholderPage title="Manage Feedbacks" />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
