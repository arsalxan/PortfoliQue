import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { aiReviewService } from '../../services/aiReviewService';
import { portfolioService } from '../../services/portfolioService';
import type { AiReviewFull, Portfolio } from '../../types/portfolio';
import { useAuth } from '../../context/AuthContext';
import { useAiReview } from '../../context/AiReviewContext';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function AiReview() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshLatestReview } = useAiReview();
  const [review, setReview] = useState<AiReviewFull | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'content' | 'performance'>('summary');
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === portfolio?.userId;

  const handleDelete = async () => {
    if (!reviewId) return;
    if (!window.confirm('Are you sure you want to delete this AI Audit review? This action cannot be undone.')) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting AI Audit review...');
    try {
      await aiReviewService.deleteReview(Number(reviewId));
      toast.success('AI Audit review deleted successfully', { id: toastId });
      refreshLatestReview();
      navigate('/portfolios');
    } catch (err) {
      toast.error('Failed to delete AI Audit review', { id: toastId });
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let interval: any;

    const fetchReviewData = async () => {
      if (!reviewId) return;
      try {
        const reviewData = await aiReviewService.getFullReview(Number(reviewId));
        setReview(reviewData);

        if (reviewData.portfolioId) {
          const portfolioData = await portfolioService.getPortfolioById(reviewData.portfolioId);
          setPortfolio(portfolioData);
        }

        // If the review is still in progress, start polling status
        if (reviewData.status === 'IN_PROGRESS') {
          interval = setInterval(async () => {
            try {
              const updated = await aiReviewService.getFullReview(Number(reviewId));
              setReview(updated);
              if (updated.status !== 'IN_PROGRESS') {
                clearInterval(interval);
                setLoading(false);
              }
            } catch (err) {
              console.error('Polling review failed', err);
            }
          }, 5000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        toast.error('Failed to load audit review details.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchReviewData();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reviewId]);

  if (loading || (review && review.status === 'IN_PROGRESS')) {
    return (
      <div className="container py-5 mt-5 text-center fade-in">
        <div className="mx-auto" style={{ maxWidth: '500px' }}>
          <div className="ai-scanner-container mb-4 shadow-lg" style={{ height: '300px', position: 'relative', overflow: 'hidden', borderRadius: '15px' }}>
            <div className="ai-scanner-line" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '3px',
              background: 'var(--primary)',
              boxShadow: '0 0 10px var(--primary)',
              animation: 'scan 2s linear infinite'
            }}></div>
            <div className="d-flex h-100 justify-content-center align-items-center flex-column text-white p-4" style={{ background: 'rgba(30, 41, 59, 0.9)' }}>
              <i className="fas fa-robot fa-4x mb-3 text-primary animate-pulse"></i>
              <h3 className="fw-bold text-white">Audit in Progress...</h3>
              <p className="opacity-75">Analyzing page metrics, HTML structure, accessibility tree, and generating optimizations.</p>
              <div className="mt-3 w-75 bg-dark rounded overflow-hidden" style={{ height: '4px' }}>
                <div className="h-100 bg-primary" style={{ width: '100%', opacity: 0.5 }}></div>
              </div>
            </div>
          </div>
          <p className="text-dark fw-medium mt-3">
            <i className="fas fa-hourglass-half me-2 text-primary"></i>
            This takes about 10-15 seconds as our AI synthesizes multiple evaluation reports.
          </p>
        </div>
        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .animate-pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!review || review.status === 'FAILED' || !portfolio) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h3>Analysis Failed</h3>
          <p className="text-muted">
            {review?.errorMessage || 'We encountered an error while attempting to process the automated audit.'}
          </p>
          <div className="mt-4">
            <Link to="/portfolios" className="btn btn-primary rounded-pill px-4">Browse Portfolios</Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper for rendering score badge colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success border-success';
    if (score >= 50) return 'text-warning border-warning';
    return 'text-danger border-danger';
  };

  return (
    <div className="container py-5 mt-4 fade-in">
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fw-bold text-primary mb-1">
            <i className="fas fa-shield-alt me-2"></i>AI Portfolio Audit
          </h1>
          <p className="text-muted mb-0">
            Automated Audit Version <strong className="text-dark">v{review.version}</strong> for{' '}
            <strong className="text-dark">{portfolio.fullName}'s Portfolio</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          {isOwner && (
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="btn btn-outline-danger rounded-pill px-3"
            >
              <i className="fas fa-trash-alt me-1"></i> Delete Audit
            </button>
          )}
          <Link to={`/portfolios`} className="btn btn-outline-secondary rounded-pill px-3">
            <i className="fas fa-arrow-left me-1"></i> Back
          </Link>
        </div>
      </div>

      {/* Scores Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h6 className="text-muted text-uppercase small fw-bold mb-3">Performance Audit</h6>
            <div className={`d-inline-flex align-items-center justify-content-center border border-3 rounded-circle mx-auto ${getScoreColor(review.performanceScore || 0)}`} 
                 style={{ width: '80px', height: '80px', fontSize: '1.75rem', fontWeight: 'bold' }}>
              {review.performanceScore}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h6 className="text-muted text-uppercase small fw-bold mb-3">Accessibility Score</h6>
            <div className={`d-inline-flex align-items-center justify-content-center border border-3 rounded-circle mx-auto ${getScoreColor(review.accessibilityScore || 0)}`} 
                 style={{ width: '80px', height: '80px', fontSize: '1.75rem', fontWeight: 'bold' }}>
              {review.accessibilityScore}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm text-center">
            <h6 className="text-muted text-uppercase small fw-bold mb-3">SEO Health</h6>
            <div className={`d-inline-flex align-items-center justify-content-center border border-3 rounded-circle mx-auto ${getScoreColor(review.seoScore || 0)}`} 
                 style={{ width: '80px', height: '80px', fontSize: '1.75rem', fontWeight: 'bold' }}>
              {review.seoScore}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4 border-0" style={{ gap: '5px' }}>
        <li className="nav-item">
          <button className={`nav-link border-0 rounded-pill px-4 py-2 ${activeTab === 'summary' ? 'active bg-primary text-white' : 'text-muted bg-light'}`}
                  onClick={() => setActiveTab('summary')}>
            Executive Summary
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link border-0 rounded-pill px-4 py-2 ${activeTab === 'content' ? 'active bg-primary text-white' : 'text-muted bg-light'}`}
                  onClick={() => setActiveTab('content')}>
            Content & Structure
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link border-0 rounded-pill px-4 py-2 ${activeTab === 'performance' ? 'active bg-primary text-white' : 'text-muted bg-light'}`}
                  onClick={() => setActiveTab('performance')}>
            Performance Suggestions
          </button>
        </li>
      </ul>

      {/* Review Content */}
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card shadow-sm border-0 mb-4 p-4 p-lg-5" style={{ borderRadius: '15px' }}>
            {activeTab === 'summary' && (
              <div>
                <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                  <div className="bg-primary rounded-circle p-2 me-3 text-white">
                    <i className="fas fa-magic"></i>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">Synthesized Verdict</h4>
                    <p className="text-muted small mb-0">Compiled by AI synthesized analysis engine</p>
                  </div>
                </div>
                <div className="ai-review-text px-1">
                  <ReactMarkdown>{review.finalReviewText || ''}</ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                  <div className="bg-info rounded-circle p-2 me-3 text-white">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">SEO & Code Quality Analysis</h4>
                    <p className="text-muted small mb-0">Page titles, structures, copy, and link trees</p>
                  </div>
                </div>
                <div className="ai-review-text px-1">
                  <ReactMarkdown>{review.jsoupReviewText || ''}</ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                  <div className="bg-success rounded-circle p-2 me-3 text-white">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">Lighthouse Heuristics Insights</h4>
                    <p className="text-muted small mb-0">Code bloat, image loads, and accessibility advice</p>
                  </div>
                </div>
                <div className="ai-review-text px-1">
                  <ReactMarkdown>{review.lighthouseReviewText || ''}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-top">
              <div className="alert bg-light border-0 d-flex align-items-center rounded-3 p-3">
                <i className="fas fa-info-circle text-primary fs-4 me-3"></i>
                <p className="mb-0 text-muted small">
                  The AI Reviewer audits structural templates, content copies, and core tags.
                  Combine these metrics with peer feedbacks for a holistic review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center mt-4">
        <a href={portfolio.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill px-5 py-2 shadow-sm">
          <i className="fas fa-external-link-alt me-2"></i> Visit Portfolio
        </a>
      </div>
    </div>
  );
}
