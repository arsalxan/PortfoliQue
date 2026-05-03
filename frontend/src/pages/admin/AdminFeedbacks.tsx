import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { Feedback } from '../../types/feedback';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Skeleton from '../../components/common/Skeleton';

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchBy, setSearchBy] = useState('');
  const [searchContent, setSearchContent] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService.getFeedbacks(searchBy, searchContent, page)
      .then(data => {
        if (!cancelled) {
          setFeedbacks(data.content);
          setTotalPages(data.totalPages);
        }
      })
      .catch(() => console.error('Failed to load feedbacks'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchBy, searchContent]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this feedback?')) {
      try {
        await adminService.deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      } catch (err) {
        alert('Failed to delete feedback.');
      }
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        <AdminSidebar />
        <div className="col-md-10 p-5">
          <div className="mb-4">
            <h1 className="fw-bold text-dark mb-1">Manage Feedbacks</h1>
            <p className="text-muted">Moderate and curate the platform's review section.</p>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-user text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0" 
                      placeholder="Filter by author username..." 
                      value={searchBy}
                      onChange={(e) => { setSearchBy(e.target.value); setPage(0); }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0" 
                      placeholder="Comment content keywords..." 
                      value={searchContent}
                      onChange={(e) => { setSearchContent(e.target.value); setPage(0); }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Feedback Content</th>
                    <th className="py-3 border-0">Author</th>
                    <th className="py-3 border-0">On Portfolio</th>
                    <th className="py-3 border-0">Rating</th>
                    <th className="py-3 border-0">Date</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && page === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton height="15px" width="30%" /><Skeleton height="40px" width="90%" className="mt-2" /></td>
                        <td className="py-3"><Skeleton height="20px" width="60%" /></td>
                        <td className="py-3"><Skeleton height="20px" width="50%" /></td>
                        <td className="py-3"><Skeleton height="25px" width="80px" /></td>
                        <td className="py-3"><Skeleton height="15px" width="70%" /></td>
                        <td className="px-4 py-3 text-end"><Skeleton width="32px" height="32px" className="ms-auto" /></td>
                      </tr>
                    ))
                  ) : feedbacks.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">No feedbacks found matching your filters.</td></tr>
                  ) : (
                    feedbacks.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-3">
                          {(() => {
                            const fields: [string, string | null][] = [
                              ['Design', f.design],
                              ['Responsiveness', f.responsiveness],
                              ['Content', f.content],
                              ['UX Flow', f.uxFlow],
                              ['Accessibility', f.accessibility],
                              ['Performance', f.technicalPerformance],
                              ['Additional', f.additional],
                            ];
                            const first = fields.find(([, v]) => v && v.trim());
                            return first ? (
                              <>
                                <span className="badge fw-normal me-2 mb-1"
                                  style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                                  {first[0]}
                                </span>
                                <div className="small text-dark">
                                  {first[1]!.substring(0, 120)}{first[1]!.length > 120 ? '…' : ''}
                                </div>
                              </>
                            ) : <span className="small text-muted fst-italic">No content</span>;
                          })()}
                        </td>
                        <td className="py-3 text-muted">@{f.username}</td>
                        <td className="py-3 text-muted">ID: #{f.portfolioId}</td>
                        <td className="py-3">
                          <span className="badge bg-secondary-subtle text-secondary">
                            Review #{f.id}
                          </span>
                        </td>
                        <td className="py-3 small text-muted">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-3"
                            onClick={() => handleDelete(f.id)}
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
