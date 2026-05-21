import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import type { Portfolio } from '../../types/portfolio.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';
import PortfolioCardSkeleton from '../../components/common/PortfolioCardSkeleton.tsx';
import Pagination from '../../components/common/Pagination.tsx';

export default function PortfolioSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, page]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await portfolioService.searchPortfolios(query, page, 6);
      setPortfolios(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
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
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Search Results</h1>
          <p className="text-muted mb-0">Showing results for: <span className="fw-bold">"{query}"</span></p>
        </div>
        <Link to="/portfolios" className="btn btn-outline-primary rounded-pill px-3">
          <i className="fas fa-arrow-left me-2"></i> Back to All
        </Link>
      </div>

      {loading ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col"><PortfolioCardSkeleton /></div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center shadow-sm" role="alert">
          {error}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm border">
          <i className="fas fa-search fa-3x mb-3 text-muted"></i>
          <h4 className="text-secondary">No matching portfolios found.</h4>
          <p className="text-muted">Try different keywords or browse all portfolios.</p>
          <Link to="/portfolios" className="btn btn-primary mt-2 rounded-pill px-4">Browse All Portfolios</Link>
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

          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
            ariaLabel="Search results pagination" 
          />
        </>
      )}
    </div>
  );
}
