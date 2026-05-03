import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';
import Skeleton from '../components/common/Skeleton';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(page);
      setNotifications(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      alert('Failed to mark all as read.');
    }
  };

  if (loading && page === 0) {
    return (
      <div className="container mt-5 px-4 mb-5 fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Skeleton width="200px" height="32px" className="mb-2" />
            <Skeleton width="300px" height="14px" />
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="list-group list-group-flush rounded overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="list-group-item p-4 d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  <Skeleton width="40%" height="20px" className="mb-2" />
                  <Skeleton width="60%" height="14px" />
                </div>
                <Skeleton width="80px" height="24px" className="ms-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 px-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Notifications</h1>
          <p className="text-muted">Stay updated with activity on your portfolios.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="list-group list-group-flush rounded shadow-sm">
          {notifications.length === 0 ? (
            <div className="list-group-item text-center py-5 text-muted">
              <i className="fas fa-bell-slash fa-3x mb-3 opacity-25"></i>
              <p>You have no notifications.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                to={`/portfolios/${notif.portfolioId}/feedbacks`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-start border-bottom ${
                  !notif.isRead ? 'list-group-item-light fw-bold bg-light' : ''
                }`}
                style={!notif.isRead ? { borderLeft: '4px solid var(--primary)' } : {}}
              >
                <div className="ms-2 me-auto">
                  <div className="mb-1">
                    <span className="text-primary me-2">{notif.senderFullName}</span>
                    <span className="text-muted small">commented on your portfolio</span>
                  </div>
                  <div className="small text-secondary">
                    Check out the latest feedback on your project.
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge rounded-pill bg-light text-dark fw-normal border">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">Page {page + 1} of {totalPages}</span>
            </li>
            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
