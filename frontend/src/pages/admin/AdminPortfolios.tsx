import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { Portfolio } from '../../types/portfolio';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Skeleton from '../../components/common/Skeleton';

export default function AdminPortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService.getPortfolios(search, page)
      .then(data => {
        if (!cancelled) {
          setPortfolios(data.content);
          setTotalPages(data.totalPages);
        }
      })
      .catch(() => console.error('Failed to load portfolios'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this portfolio?')) {
      try {
        await adminService.deletePortfolio(id);
        setPortfolios(portfolios.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete portfolio.');
      }
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        <AdminSidebar />
        <div className="col-md-10 p-5">
          <div className="mb-4">
            <h1 className="fw-bold text-dark mb-1">Manage Portfolios</h1>
            <p className="text-muted">Curate and moderate all community project submissions.</p>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search by project title, description or category..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Portfolio URL</th>
                    <th className="py-3 border-0">Author</th>
                    <th className="py-3 border-0">Feedbacks</th>
                    <th className="py-3 border-0">Date</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && page === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton height="20px" width="80%" /><Skeleton height="12px" width="50%" className="mt-2" /></td>
                        <td className="py-3"><Skeleton height="20px" width="60%" /><Skeleton height="12px" width="40%" className="mt-2" /></td>
                        <td className="py-3"><center><Skeleton circle width="24px" height="24px" /></center></td>
                        <td className="py-3"><Skeleton height="15px" width="70%" /></td>
                        <td className="px-4 py-3 text-end"><Skeleton width="32px" height="32px" className="ms-auto" /></td>
                      </tr>
                    ))
                  ) : portfolios.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No portfolios found matching your search.</td></tr>
                  ) : (
                    portfolios.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="fw-bold text-primary text-decoration-none d-block text-truncate"
                            style={{ maxWidth: '260px' }}
                            title={p.url}
                          >
                            {p.url}
                          </a>
                          <div className="small text-muted text-truncate" style={{ maxWidth: '260px' }}>
                            {p.description || <em>No description</em>}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="fw-semibold">{p.fullName}</div>
                          <div className="small text-muted">@{p.username}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}>
                            {p.feedbackCount}
                          </span>
                        </td>
                        <td className="py-3 small text-muted">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-3"
                            onClick={() => handleDelete(p.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{page + 1}</span>
                </li>
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
