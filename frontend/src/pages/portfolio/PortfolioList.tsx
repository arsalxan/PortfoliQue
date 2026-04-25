import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import type { Portfolio, PortfolioPage } from '../../types/portfolio.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';

export default function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolios(currentPage);
  }, [currentPage]);

  const fetchPortfolios = async (page: number) => {
    setLoading(true);
    try {
      const data: PortfolioPage = await portfolioService.getAllPortfolios(page, 9);
      setPortfolios(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load portfolios. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/portfolios/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await portfolioService.deletePortfolio(id);
        setPortfolios(portfolios.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete portfolio.');
      }
    }
  };

  return (
    <div className="container mt-4 mb-5 fade-in">

      {/* Page header: title + search + add button in one unified bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-5">
        <h2 className="mb-0 fw-bold">Explore Portfolios</h2>
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-grow-1" style={{ maxWidth: '480px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by description or username…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-outline-primary px-3 flex-shrink-0" type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
        <Link to="/portfolios/new" className="btn btn-primary flex-shrink-0">
          <i className="fas fa-plus me-2"></i> Add New
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="alert alert-danger text-center shadow-sm" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i> {error}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="alert alert-info text-center shadow-sm py-5" role="alert">
          <i className="fas fa-info-circle fa-3x mb-3 text-primary d-block"></i>
          <h4 className="alert-heading">No Portfolios Yet!</h4>
          <p className="mb-0">Be the first to submit your portfolio and get feedback!</p>
          <Link to="/portfolios/new" className="btn btn-primary mt-3">Submit Now</Link>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {portfolios.map((portfolio) => (
              <PortfolioCard 
                key={portfolio.id} 
                portfolio={portfolio} 
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-5 d-flex justify-content-center" aria-label="Portfolio pagination">
              <ul className="pagination shadow-sm">
                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
