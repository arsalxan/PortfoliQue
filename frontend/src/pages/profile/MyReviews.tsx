import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { aiReviewService } from '../../services/aiReviewService';
import type { Portfolio, AiReviewHistory } from '../../types/portfolio';
import ProfileSidebar from '../../components/layout/ProfileSidebar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyReviews() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<AiReviewHistory[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch user's portfolios on load
  useEffect(() => {
    const fetchUserPortfolios = async () => {
      setLoadingPortfolios(true);
      try {
        const data = await portfolioService.getMyPortfolios(0, 100);
        setPortfolios(data.content);
        if (data.content.length > 0) {
          setSelectedPortfolioId(data.content[0].id);
        }
      } catch (err) {
        toast.error('Failed to load your portfolios.');
      } finally {
        setLoadingPortfolios(false);
      }
    };
    fetchUserPortfolios();
  }, []);

  // Fetch reviews for the selected portfolio and page
  useEffect(() => {
    if (selectedPortfolioId === null) return;
    const fetchHistory = async () => {
      setLoadingReviews(true);
      try {
        const data = await aiReviewService.getReviewHistory(selectedPortfolioId, page, 5);
        setReviews(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        toast.error('Failed to load review history.');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchHistory();
  }, [selectedPortfolioId, page]);

  const handlePortfolioChange = (portfolioId: number) => {
    setSelectedPortfolioId(portfolioId);
    setPage(0);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted';
    if (score >= 90) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        <ProfileSidebar />

        <div className="col-lg-10 col-md-11 p-4">
          <div className="mb-4">
            <h1 className="fw-bold text-primary mb-1">AI Audit History</h1>
            <p className="text-muted">Browse historical audit versions, scores, and recommendations.</p>
          </div>

          {loadingPortfolios ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <i className="fas fa-magic fa-4x mb-3 text-muted opacity-25"></i>
              <h3>No Portfolios Found</h3>
              <p className="text-muted">You need to register at least one portfolio to run AI audits.</p>
              <Link to="/portfolios/new" className="btn btn-primary rounded-pill mt-3 px-4">
                Add New Portfolio
              </Link>
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px' }}>
              <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                  <label htmlFor="portfolio-select" className="form-label fw-semibold text-muted small text-uppercase">
                    Select Portfolio URL
                  </label>
                  <select
                    id="portfolio-select"
                    className="form-select border-0 bg-light py-2.5 px-3 rounded-3"
                    value={selectedPortfolioId || ''}
                    onChange={(e) => handlePortfolioChange(Number(e.target.value))}
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.url}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingReviews ? (
                <div className="text-center py-5">
                  <LoadingSpinner />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-history fa-3x mb-3 text-muted opacity-25"></i>
                  <h5>No Audits Run Yet</h5>
                  <p className="text-muted small">You haven't run any AI reviews for this portfolio.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 px-3 py-3 rounded-start">Version</th>
                        <th className="border-0 py-3">Audit Date</th>
                        <th className="border-0 py-3 text-center">Perf</th>
                        <th className="border-0 py-3 text-center">Acc</th>
                        <th className="border-0 py-3 text-center">SEO</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 px-3 py-3 rounded-end text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 fw-bold text-dark">v{r.version}</td>
                          <td className="text-muted small">{formatDate(r.createdAt)}</td>
                          <td className={`text-center fw-bold ${getScoreColor(r.performanceScore)}`}>
                            {r.performanceScore ?? '-'}
                          </td>
                          <td className={`text-center fw-bold ${getScoreColor(r.accessibilityScore)}`}>
                            {r.accessibilityScore ?? '-'}
                          </td>
                          <td className={`text-center fw-bold ${getScoreColor(r.seoScore)}`}>
                            {r.seoScore ?? '-'}
                          </td>
                          <td>
                            {r.status === 'COMPLETED' && <span className="badge bg-success-subtle text-success">Success</span>}
                            {r.status === 'FAILED' && <span className="badge bg-danger-subtle text-danger">Failed</span>}
                            {r.status === 'IN_PROGRESS' && <span className="badge bg-warning-subtle text-warning">Running</span>}
                          </td>
                          <td className="px-3 text-end">
                            <Link
                              to={`/portfolios/ai-reviews/${r.id}`}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              <i className="fas fa-eye me-1"></i> View Audit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    ariaLabel="Review history pagination"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
