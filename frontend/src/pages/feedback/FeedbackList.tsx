import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import { feedbackService } from '../../services/feedbackService.ts';
import type { Portfolio } from '../../types/portfolio.ts';
import type { Feedback } from '../../types/feedback.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';

export default function FeedbackList() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summaries, setSummaries] = useState<Record<number, { text: string; loading: boolean }>>({});

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id), currentPage);
    }
  }, [id, currentPage]);

  const fetchData = async (portfolioId: number, page: number) => {
    setLoading(true);
    try {
      const [portData, feedData] = await Promise.all([
        portfolioService.getPortfolioById(portfolioId),
        feedbackService.getFeedbacksForPortfolio(portfolioId, page, 10)
      ]);
      setPortfolio(portData);
      setFeedbacks(feedData.content);
      setTotalPages(feedData.totalPages);
    } catch (err) {
      setError('Failed to load feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (feedbackId: number) => {
    setSummaries(prev => ({ ...prev, [feedbackId]: { text: '', loading: true } }));
    try {
      const data = await feedbackService.summarizeFeedback(feedbackId);
      setSummaries(prev => ({ ...prev, [feedbackId]: { text: data.summary, loading: false } }));
    } catch (err) {
      setSummaries(prev => ({ ...prev, [feedbackId]: { text: 'Failed to generate summary.', loading: false } }));
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Back button */}
      <Link to="/portfolios" className="btn btn-sm btn-outline-secondary mb-4">
        <i className="fas fa-arrow-left me-2"></i> Back to Portfolios
      </Link>

      <div className="row g-4">

        {/* ── LEFT PANEL: Portfolio Info (sticky) ── */}
        <div className="col-lg-4">
          <div style={{ position: 'sticky', top: '72px' }}>
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-3">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-layer-group me-2 text-primary"></i>Portfolio Details
                </h5>
                {portfolio && <PortfolioCard portfolio={portfolio} />}
              </div>
            </div>

            <Link
              to={`/portfolios/${id}/feedbacks/new`}
              className="btn btn-primary btn-lg w-100 shadow-sm"
            >
              <i className="fas fa-pen me-2"></i> Give Your Feedback
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL: Feedbacks ── */}
        <div className="col-lg-8">
          {/* Section header */}
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="h4 fw-bold mb-0">Community Feedbacks</h2>
              <p className="text-muted small mb-0">What the community thinks about this portfolio</p>
            </div>
            <span className="badge rounded-pill border fw-normal px-3 py-2"
              style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary)', fontSize: '0.85rem' }}>
              {portfolio?.feedbackCount || 0} reviews
            </span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {feedbacks.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="fas fa-comments fa-3x mb-3" style={{ color: 'var(--border)' }}></i>
                <h5 className="fw-bold mb-2">No feedback yet</h5>
                <p className="text-muted mb-0">Be the first to share your thoughts!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex flex-column gap-3">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">

                      {/* Reviewer header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          {/* Avatar initial — subtle, not heavy blue */}
                          <div
                            className="d-flex align-items-center justify-content-center fw-bold rounded-circle flex-shrink-0"
                            style={{
                              width: '42px', height: '42px', fontSize: '1rem',
                              backgroundColor: 'rgba(37,99,235,0.1)',
                              color: 'var(--primary)'
                            }}
                          >
                            {feedback.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{feedback.fullName}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              @{feedback.username} · {new Date(feedback.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/portfolios/${id}/feedbacks/${feedback.id}`}
                          className="btn btn-sm btn-outline-primary"
                          style={{ borderRadius: '8px' }}
                        >
                          Full Review
                        </Link>
                      </div>

                      {/* Feedback preview fields */}
                      <div className="d-flex flex-column gap-2">
                        {feedback.design && (
                          <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--background)' }}>
                            <div className="d-flex align-items-center mb-1 gap-2">
                              <span className="badge rounded-pill fw-semibold"
                                style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)', fontSize: '0.72rem' }}>
                                Design
                              </span>
                            </div>
                            <p className="mb-0 small text-truncate-2-lines" style={{ color: 'var(--text-primary)' }}>
                              {feedback.design}
                            </p>
                          </div>
                        )}
                        {feedback.responsiveness && (
                          <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--background)' }}>
                            <div className="d-flex align-items-center mb-1 gap-2">
                              <span className="badge rounded-pill fw-semibold"
                                style={{ backgroundColor: 'rgba(72,187,120,0.12)', color: '#2f855a', fontSize: '0.72rem' }}>
                                Responsiveness
                              </span>
                            </div>
                            <p className="mb-0 small text-truncate-2-lines" style={{ color: 'var(--text-primary)' }}>
                              {feedback.responsiveness}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* AI Summarize */}
                      <div className="mt-3 pt-3 border-top">
                        <button
                          className="btn btn-sm fw-semibold"
                          style={{
                            backgroundColor: 'rgba(37,99,235,0.08)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(37,99,235,0.2)',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleSummarize(feedback.id)}
                          disabled={summaries[feedback.id]?.loading}
                        >
                          {summaries[feedback.id]?.loading ? (
                            <><span className="spinner-border spinner-border-sm me-1"></span> Summarizing...</>
                          ) : (
                            <><i className="fas fa-robot me-1"></i> AI Summarize</>
                          )}
                        </button>

                        {summaries[feedback.id]?.text && (
                          <div className="mt-3 p-3 rounded-3 fade-in"
                            style={{ backgroundColor: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <i className="fas fa-magic" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}></i>
                              <span className="small fw-bold" style={{ color: 'var(--primary)' }}>AI Summary</span>
                            </div>
                            <p className="mb-0 small fst-italic" style={{ color: 'var(--text-primary)' }}>
                              "{summaries[feedback.id].text}"
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-5 d-flex justify-content-center">
                  <ul className="pagination pagination-sm">
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(i)}>{i + 1}</button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
