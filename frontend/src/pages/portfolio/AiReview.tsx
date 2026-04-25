import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import type { AiReviewResponse, Portfolio } from '../../types/portfolio';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function AiReview() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<AiReviewResponse | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [portfolioData, reviewData] = await Promise.all([
          portfolioService.getPortfolioById(Number(id)),
          portfolioService.getAiReview(Number(id))
        ]);
        setPortfolio(portfolioData);
        setReview(reviewData);
      } catch (err) {
        toast.error('Failed to generate AI review. Please try again.');
        console.error('Failed to load project details for AI review:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center fade-in">
        <div className="mx-auto" style={{ maxWidth: '500px' }}>
          <div className="ai-scanner-container mb-4 shadow-lg" style={{ height: '300px' }}>
            <div className="ai-scanner-line"></div>
            <div className="d-flex h-100 justify-content-center align-items-center flex-column text-white p-4">
              <i className="fas fa-robot fa-4x mb-3 pulse-primary text-primary"></i>
              <h3 className="fw-bold text-white">Audit in Progress...</h3>
              <p className="opacity-75">Analyzing page metadata, accessibility, and content quality using Deep Learning.</p>
              <div className="mt-3 w-75 bg-dark rounded overflow-hidden" style={{ height: '4px' }}>
                <div className="h-100 bg-primary pulse-primary" style={{ width: '100%', opacity: 0.5 }}></div>
              </div>
            </div>
          </div>
          <p className="text-dark fw-medium mt-3">
            <i className="fas fa-hourglass-half me-2 text-primary"></i>
            This usually takes about 5-10 seconds as our AI models process the portfolio site.
          </p>
        </div>
      </div>
    );
  }

  if (!review || !portfolio) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h3>Analysis Unavailable</h3>
          <p className="text-muted">We encountered an issue while generating the AI review. This could be due to the portfolio URL being unreachable or an internal service error.</p>
          <div className="mt-4">
            <Link to="/portfolios" className="btn btn-primary rounded-pill px-4">Browse Portfolios</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4 fade-in">
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fw-bold text-primary mb-1">
            <i className="fas fa-shield-alt me-2"></i>AI Portfolio Audit
          </h1>
          <p className="text-muted mb-0">
            Intelligent analysis for <strong className="text-dark">{portfolio.fullName}'s Portfolio</strong>
          </p>
        </div>
        <Link to={`/portfolios`} className="btn btn-outline-secondary rounded-pill px-3">
          <i className="fas fa-arrow-left me-1"></i> Back
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4 col-sm-6">
          <div className="card h-100 ai-glow-card p-4 border-0 text-center">
            <div className="rounded-circle bg-primary-subtle d-inline-flex p-3 mx-auto mb-3">
              <i className="fas fa-pager fs-3 text-primary"></i>
            </div>
            <h6 className="text-muted text-uppercase small fw-bold mb-2">Page Identity</h6>
            <h5 className="mb-0 text-dark fw-bold text-truncate" title={review.pageTitle}>
              {review.pageTitle || 'No Title Found'}
            </h5>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="card h-100 ai-glow-card p-4 border-0 text-center">
            <div className="rounded-circle bg-info-subtle d-inline-flex p-3 mx-auto mb-3">
              <i className="fas fa-link fs-3 text-info"></i>
            </div>
            <h6 className="text-muted text-uppercase small fw-bold mb-2">Internal Links</h6>
            <h3 className="mb-0 text-dark fw-bold">{review.linkCount}</h3>
          </div>
        </div>
        <div className="col-md-4 col-sm-12">
          <div className="card h-100 ai-glow-card p-4 border-0 text-center">
            <div className="rounded-circle bg-success-subtle d-inline-flex p-3 mx-auto mb-3">
              <i className="fas fa-images fs-3 text-success"></i>
            </div>
            <h6 className="text-muted text-uppercase small fw-bold mb-2">Visual Assets</h6>
            <h3 className="mb-0 text-dark fw-bold">{review.imageCount}</h3>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="ai-review-content shadow-lg border-0 mb-4">
            <div className="d-flex align-items-center mb-4 border-bottom pb-4">
              <div className="bg-primary rounded-circle p-2 me-3 pulse-primary">
                <i className="fas fa-magic text-white"></i>
              </div>
              <div>
                <h2 className="mb-0 fs-3 fw-bold">Executive Summary & Recommendations</h2>
                <p className="text-muted small mb-0">Generated by PortfoliQue AI v1.0</p>
              </div>
            </div>
            
            <div className="ai-review-text px-lg-3">
              <ReactMarkdown>{review.review}</ReactMarkdown>
            </div>
            
            <div className="mt-5 pt-4 border-top">
              <div className="alert bg-light border-0 d-flex align-items-center rounded-3 p-3">
                <i className="fas fa-info-circle text-primary fs-4 me-3"></i>
                <p className="mb-0 text-muted small">
                  The AI Reviewer scrapes the accessibility tree and structural metadata of your portfolio to provide objective feedback. 
                  For a complete assessment, combine these insights with subjective feedback from other designers in the community.
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
