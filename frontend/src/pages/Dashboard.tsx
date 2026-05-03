import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { portfolioService } from '../services/portfolioService.ts';
import { feedbackService } from '../services/feedbackService.ts';
import type { Portfolio } from '../types/portfolio.ts';
import type { Feedback } from '../types/feedback.ts';
import PortfolioCard from '../components/portfolio/PortfolioCard.tsx';
import FeedbackSummaryCard from '../components/feedback/FeedbackSummaryCard.tsx';
import PortfolioCardSkeleton from '../components/common/PortfolioCardSkeleton.tsx';
import FeedbackSummaryCardSkeleton from '../components/common/FeedbackSummaryCardSkeleton.tsx';
import Skeleton from '../components/common/Skeleton.tsx';
import ProfileSidebar from '../components/layout/ProfileSidebar.tsx';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [portData, feedData] = await Promise.all([
        portfolioService.getMyPortfolios(0, 3), // Show top 3
        feedbackService.getMyFeedbacks(0, 3)    // Show top 3
      ]);
      setPortfolios(portData.content);
      setFeedbacks(feedData.content);
    } catch (err) {
      setError('Failed to load dashboard data.');
      toast.error('Unable to fetch your dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio? This cannot be undone.')) {
      try {
        await portfolioService.deletePortfolio(id);
        setPortfolios(portfolios.filter(p => p.id !== id));
        toast.success('Portfolio removed successfully.');
      } catch (err) {
        toast.error('Failed to delete portfolio.');
      }
    }
  };

  const handleFeedbackDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackService.deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
        toast.success('Feedback deleted.');
      } catch (err) {
        toast.error('Failed to delete feedback.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid profile-page-bg">
        <div className="row g-0">
          <ProfileSidebar />
          <div className="col-lg-10 col-md-11 p-4 mb-5 fade-in">
            {/* Skeleton Welcome banner */}
            <div className="mb-4">
              <div className="bg-white p-5 rounded-3 shadow-sm border-0 position-relative">
                <Skeleton height="40px" width="60%" className="mb-3" />
                <Skeleton height="20px" width="40%" />
              </div>
            </div>

            {/* Skeleton Portfolios Section */}
            <section className="mb-5">
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div><Skeleton height="24px" width="200px" /></div>
              </div>
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="col"><PortfolioCardSkeleton /></div>
                ))}
              </div>
            </section>

            {/* Skeleton Feedbacks Section */}
            <section>
              <div className="d-flex justify-content-between align-items-end mb-4">
                <div><Skeleton height="24px" width="200px" /></div>
              </div>
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="col"><FeedbackSummaryCardSkeleton /></div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        <ProfileSidebar />

        <div className="col-lg-10 col-md-11 p-4 mb-5 fade-in">
          {/* Welcome banner */}
          <div className="mb-4">
            <div className="bg-white p-5 rounded-3 shadow-sm border-0 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 p-4 opacity-10">
                <i className="fas fa-chart-line fa-6x" />
              </div>
              <h1 className="display-5 fw-bold text-dark mb-2">Welcome back, {user?.username}!</h1>
              <p className="lead text-secondary mb-0">Track your portfolios and the feedback you've shared with the community.</p>
            </div>
          </div>

          {error && <div className="alert alert-danger shadow-sm">{error}</div>}

          {/* Portfolios Section */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h2 className="h3 fw-bold mb-1">My Submitted Portfolios</h2>
                <p className="text-muted small mb-0">Manage your work and view AI insights.</p>
              </div>
              <Link to="/profile/myportfolios" className="text-primary fw-600 text-decoration-none small">
                View All My Portfolios <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                <i className="fas fa-folder-open fa-3x mb-3 text-muted" />
                <h4 className="text-secondary">No Portfolios Yet!</h4>
                <p className="text-muted">Submit your first portfolio to start getting feedbacks!</p>
                <Link to="/portfolios/new" className="btn btn-primary mt-3">
                  <i className="fas fa-plus me-2" /> Submit Now
                </Link>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {portfolios.map(p => (
                  <PortfolioCard key={p.id} portfolio={p} onDelete={handlePortfolioDelete} />
                ))}
              </div>
            )}
          </section>

          {/* Feedbacks Section */}
          <section>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h2 className="h3 fw-bold mb-1">Feedbacks I've Given</h2>
                <p className="text-muted small mb-0">Review the feedback you've shared with others.</p>
              </div>
              <Link to="/profile/myfeedbacks" className="text-primary fw-600 text-decoration-none small">
                View All Given Feedbacks <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>

            {feedbacks.length === 0 ? (
              <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                <i className="fas fa-comment-slash fa-3x mb-3 text-muted" />
                <h4 className="text-secondary">No Feedback Given Yet!</h4>
                <p className="text-muted">Browse portfolios and share your expertise!</p>
                <Link to="/portfolios" className="btn btn-outline-primary mt-3">
                  <i className="fas fa-search me-2" /> Browse Portfolios
                </Link>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {feedbacks.map(f => (
                  <FeedbackSummaryCard key={f.id} feedback={f} onDelete={handleFeedbackDelete} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
