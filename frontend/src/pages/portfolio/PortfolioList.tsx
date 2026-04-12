import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import type { Portfolio, PortfolioPage } from '../../types/portfolio.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';

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
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bold text-primary mb-0">All Portfolios</h1>
        <Link to="/portfolios/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add New Portfolio
        </Link>
      </div>

      <div className="row mb-5 justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSearch} className="input-group shadow-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search portfolios by user, description or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary px-4" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Fetching portfolios...</p>
        </div>
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
