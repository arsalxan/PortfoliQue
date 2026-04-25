import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import type { Feedback } from '../../types/feedback';
import FeedbackSummaryCard from '../../components/feedback/FeedbackSummaryCard';
import ProfileSidebar from '../../components/layout/ProfileSidebar';

export default function MyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getMyFeedbacks(page, 9);
      setFeedbacks(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load your feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackService.deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      } catch (err) {
        alert('Failed to delete feedback.');
      }
    }
  };

  return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        <ProfileSidebar />
        
        <div className="col-lg-10 col-md-11 p-4">
          <div className="mb-4">
            <h1 className="fw-bold text-primary mb-1">My Feedbacks</h1>
            <p className="text-muted">A history of all reviews you have shared with the community.</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <i className="fas fa-comments fa-4x mb-3 text-muted opacity-25"></i>
              <h3>No Feedbacks Found</h3>
              <p className="text-muted">You haven't given any feedback yet.</p>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {feedbacks.map(f => (
                  <FeedbackSummaryCard key={f.id} feedback={f} onDelete={handleDelete} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
                    </li>
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
