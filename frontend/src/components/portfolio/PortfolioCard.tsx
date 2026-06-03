import { Link, useNavigate } from 'react-router-dom';
import type { Portfolio } from '../../types/portfolio';
import { useAuth } from '../../context/AuthContext';
import { useAiReview } from '../../context/AiReviewContext';
import { aiReviewService } from '../../services/aiReviewService';
import toast from 'react-hot-toast';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete?: (id: number) => void;
}

const getOptimizedImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/defaultscreenshot.svg';
  
  // Apply Cloudinary on-the-fly optimization if it is a Cloudinary asset URL
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_600,c_scale/');
  }
  return url;
}

export default function PortfolioCard({ portfolio, onDelete }: PortfolioCardProps) {
  const { user } = useAuth();
  const { latestReview, setLatestReview } = useAiReview();
  const navigate = useNavigate();
  const isOwner = user?.id === portfolio.userId;

  const displayScreenshot = getOptimizedImageUrl(portfolio.screenshot);

  const handleAiReviewTrigger = async () => {
    const loadingToast = toast.loading('Initializing AI Audit Pipeline...');
    try {
      const statusResponse = await aiReviewService.triggerReview(portfolio.id);
      setLatestReview(statusResponse);
      toast.success('AI Audit triggered! Check status in navigation bar.', { id: loadingToast });
      navigate(`/portfolios/ai-reviews/${statusResponse.id}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to trigger AI Review.';
      toast.error(errMsg, { id: loadingToast });
    }
  };

  return (
    <div className="col">
      <div className="portfolio-card card h-100 shadow-sm">
        <div className="portfolio-card-img-container">
          <Link 
            to={`/portfolios/${portfolio.id}/feedbacks`} 
            className="position-absolute top-0 start-0 w-100 h-100 d-block"
            style={{ zIndex: 2 }}
            aria-label={`View ${portfolio.fullName}'s Portfolio Feedbacks`}
          >
            <img 
              src={displayScreenshot} 
              className="portfolio-card-img" 
              alt={`${portfolio.fullName}'s Portfolio`} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/defaultscreenshot.svg';
              }}
            />
          </Link>
        </div>
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title fw-bold mb-0 text-truncate me-2 text-primary-emphasis">
              {portfolio.fullName}'s Portfolio
            </h5>
            <Link to={`/portfolios/${portfolio.id}/feedbacks`} className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 text-decoration-none">
              <i className="fas fa-comments me-1"></i> {portfolio.feedbackCount || 0}
            </Link>
          </div>
          
          <p className="card-subtitle text-secondary mb-2">
            by <small className="text-muted"><span className="username-display">{portfolio.username}</span></small>
          </p>
          
          <p className="card-text text-truncate-2-lines flex-grow-1">
            {portfolio.description || <span className="text-muted">No description provided.</span>}
          </p>

          <div className="mt-auto pt-3 d-flex flex-wrap justify-content-end gap-2">
            <a 
              href={portfolio.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline-primary btn-sm d-flex align-items-center"
            >
              <i className="fas fa-external-link-alt me-1"></i> Visit
            </a>
            {portfolio.gitRepo && (
              <a 
                href={portfolio.gitRepo} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
              >
                <i className="fab fa-github me-1"></i> Git Repo
              </a>
            )}
            
            {isOwner ? (
              latestReview && latestReview.portfolioId === portfolio.id && latestReview.status === 'IN_PROGRESS' ? (
                <button disabled className="btn btn-warning btn-sm d-flex align-items-center opacity-75">
                  <i className="fas fa-spinner fa-spin me-1"></i> Auditing...
                </button>
              ) : (
                <button onClick={handleAiReviewTrigger} className="btn btn-info btn-sm d-flex align-items-center">
                  <i className="fas fa-robot me-1"></i> AI Review
                </button>
              )
            ) : (
              <Link to={`/portfolios/${portfolio.id}/feedbacks/new`} className="btn btn-primary btn-sm d-flex align-items-center">
                <i className="fas fa-comment-dots me-1"></i> Give Feedback
              </Link>
            )}

            {isOwner && (
              <div className="d-flex gap-1 ms-auto mt-2 w-100 justify-content-end">
                <Link 
                  to={`/portfolios/${portfolio.id}/edit`} 
                  className="btn btn-sm btn-outline-warning rounded-pill"
                  title="Edit Portfolio"
                >
                  <i className="fas fa-edit"></i>
                </Link>
                <button 
                  onClick={() => onDelete?.(portfolio.id)}
                  className="btn btn-sm btn-outline-danger rounded-pill"
                  title="Delete Portfolio"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
