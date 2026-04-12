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
    <div className="container-fluid py-4">
      <div className="feedback-page-container">
        {/* Left Side: Portfolio Info (Sticky) */}
        <div className="portfolio-card-container">
          <div className="mb-3">
            <Link to="/portfolios" className="btn btn-sm btn-outline-secondary mb-3">
              <i className="fas fa-arrow-left me-2"></i> Back to Portfolios
            </Link>
            <h2 className="h4 fw-bold mb-3">Portfolio Details</h2>
          </div>
          {portfolio && <PortfolioCard portfolio={portfolio} />}
          <div className="mt-4">
            <Link to={`/portfolios/${id}/feedbacks/new`} className="btn btn-primary btn-lg w-100 shadow-sm">
              <i className="fas fa-pen me-2"></i> Give Your Feedback
            </Link>
          </div>
        </div>

        {/* Right Side: Feedbacks List */}
        <div className="feedbacks-container">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h2 className="h4 fw-bold mb-0">Community Feedbacks</h2>
            <span className="badge bg-light text-primary border">{portfolio?.feedbackCount || 0} Total</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {feedbacks.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm border">
              <i className="fas fa-comments fa-3x mb-3 text-muted"></i>
              <h5 className="text-secondary">No feedback has been submitted yet.</h5>
              <p className="text-muted">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <>
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="card feedback-card mb-4 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          {feedback.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{feedback.fullName}</h6>
                          <small className="text-muted">@{feedback.username} • {new Date(feedback.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                      <Link to={`/portfolios/${id}/feedbacks/${feedback.id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </Link>
                    </div>

                    <div className="feedback-fields-preview">
                      {feedback.design && (
                        <div className="mb-2">
                          <span className="badge bg-light text-dark me-2 small uppercase">Design</span>
                          <p className="mb-0 small text-truncate-2-lines">{feedback.design}</p>
                        </div>
                      )}
                      {feedback.responsiveness && (
                        <div className="mb-2">
                          <span className="badge bg-light text-dark me-2 small uppercase">Responsiveness</span>
                          <p className="mb-0 small text-truncate-2-lines">{feedback.responsiveness}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-top">
                      <button 
                        className="btn btn-sm btn-outline-info"
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
                        <div className="mt-3 p-3 bg-light rounded border border-info animate__animated animate__fadeIn">
                          <h6 className="small fw-bold text-info"><i className="fas fa-magic me-1"></i> AI Summary:</h6>
                          <p className="mb-0 small font-italic">"{summaries[feedback.id].text}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

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
