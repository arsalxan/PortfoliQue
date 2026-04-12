import { Link } from 'react-router-dom';
import type { Portfolio } from '../../types/portfolio.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete?: (id: number) => void;
}

export default function PortfolioCard({ portfolio, onDelete }: PortfolioCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === portfolio.userId;



  return (
    <div className="col">
      <div className="card h-100 portfolio-card">
        <div className="portfolio-card-img-container">
          {portfolio.screenshot ? (
            <img 
              src={portfolio.screenshot} 
              className="portfolio-card-img" 
              alt={`${portfolio.fullName}'s Portfolio`} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/defaultscreenshot.svg';
              }}
            />
          ) : (
            <div className="portfolio-card-img-fallback">
              <i className="fas fa-image"></i>
              <span>No Screenshot</span>
            </div>
          )}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">
              <Link to={portfolio.url} target="_blank" className="text-decoration-none">
                {portfolio.fullName}'s Portfolio
              </Link>
            </h5>
            <span className="badge bg-primary-subtle rounded-pill">
              {portfolio.feedbackCount} Feedbacks
            </span>
          </div>
          <p className="card-subtitle mb-2 text-muted small">
            <i className="fas fa-user me-1"></i> {portfolio.username}
          </p>
          <p className="card-text text-truncate-2-lines flex-grow-1">
            {portfolio.description || 'No description provided.'}
          </p>
          
          <div className="mt-3 pt-3 border-top d-flex flex-wrap gap-2">
            <Link 
              to={`/portfolios/${portfolio.id}/feedbacks`} 
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fas fa-comments me-1"></i> Feedbacks
            </Link>
            
            {portfolio.gitRepo && (
              <a 
                href={portfolio.gitRepo} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fab fa-github me-1"></i> Repo
              </a>
            )}

            {isOwner ? (
              <>
                <Link 
                  to={`/portfolios/${portfolio.id}/ai-review`} 
                  className="btn btn-sm btn-primary"
                >
                  <i className="fas fa-robot me-1"></i> AI Review
                </Link>
                <Link 
                  to={`/portfolios/${portfolio.id}/edit`} 
                  className="btn btn-sm btn-outline-warning"
                  title="Edit Portfolio"
                >
                  <i className="fas fa-edit"></i>
                </Link>
                {onDelete && (
                  <button 
                    onClick={() => onDelete(portfolio.id)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Portfolio"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </>
            ) : (
              <Link 
                to={`/portfolios/${portfolio.id}/feedbacks/new`} 
                className="btn btn-sm btn-primary"
              >
                <i className="fas fa-pen me-1"></i> Give Feedback
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
