import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import ScrollToTop from './components/common/ScrollToTop.tsx';

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
import AiReview from './pages/portfolio/AiReview.tsx';

// Feedback Pages
import FeedbackList from './pages/feedback/FeedbackList.tsx';
import FeedbackCreate from './pages/feedback/FeedbackCreate.tsx';
import FeedbackDetail from './pages/feedback/FeedbackDetail.tsx';

// Dashboard Page
import Dashboard from './pages/Dashboard.tsx';
import Profile from './pages/profile/Profile.tsx';
import MyPortfolios from './pages/profile/MyPortfolios.tsx';
import MyFeedbacks from './pages/profile/MyFeedbacks.tsx';
import Notifications from './pages/Notifications.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import AdminPortfolios from './pages/admin/AdminPortfolios.tsx';
import AdminFeedbacks from './pages/admin/AdminFeedbacks.tsx';


import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Toaster 
          position="top-right" 
          containerStyle={{
            top: 70,
          }}
          toastOptions={{ duration: 4000 }} 
        />
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
            <Route path="/portfolios/:id/feedbacks" element={<FeedbackList />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/myportfolios" element={<MyPortfolios />} />
              <Route path="/profile/myfeedbacks" element={<MyFeedbacks />} />
              <Route path="/portfolios/new" element={<PortfolioCreate />} />
              <Route path="/portfolios/:id/edit" element={<PortfolioEdit />} />
              <Route path="/portfolios/:id/feedbacks/new" element={<FeedbackCreate />} />
              <Route path="/portfolios/:portfolioId/feedbacks/:feedbackId" element={<FeedbackDetail />} />
              <Route path="/portfolios/:id/ai-review" element={<AiReview />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/portfolios" element={<AdminPortfolios />} />
              <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
            </Route>

            {/* Error Handlers */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
