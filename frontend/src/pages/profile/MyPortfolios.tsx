import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import type { Portfolio } from '../../types/portfolio';
import PortfolioCard from '../../components/portfolio/PortfolioCard';
import PortfolioCardSkeleton from '../../components/common/PortfolioCardSkeleton';
import ProfileSidebar from '../../components/layout/ProfileSidebar';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function MyPortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [page]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const data = await portfolioService.getMyPortfolios(page, 6);
      setPortfolios(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load your portfolios.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setPortfolioToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!portfolioToDelete) return;
    
    try {
      await portfolioService.deletePortfolio(portfolioToDelete);
      setPortfolios(portfolios.filter(p => p.id !== portfolioToDelete));
      toast.success('Portfolio deleted successfully');
    } catch (err) {
      toast.error('Failed to delete portfolio');
    } finally {
      setShowDeleteModal(false);
      setPortfolioToDelete(null);
    }
  };

  return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        <ProfileSidebar />
        
        <div className="col-lg-10 col-md-11 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-bold text-primary mb-1">My Portfolios</h1>
              <p className="text-muted">Manage all the work you have submitted.</p>
            </div>
            <Link to="/portfolios/new" className="btn btn-primary px-4">
              <i className="fas fa-plus me-2"></i> Add New
            </Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="col">
                  <PortfolioCardSkeleton />
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <i className="fas fa-briefcase fa-4x mb-3 text-muted opacity-25"></i>
              <h3>No Portfolios Found</h3>
              <p className="text-muted">You haven't submitted any portfolios yet.</p>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {portfolios.map(p => (
                  <PortfolioCard key={p.id} portfolio={p} onDelete={confirmDelete} />
                ))}
              </div>

              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
                ariaLabel="My portfolios pagination" 
              />
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        show={showDeleteModal}
        title="Confirm Delete"
        body="Are you sure you want to delete this portfolio? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
