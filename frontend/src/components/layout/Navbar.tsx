import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useAiReview } from '../../context/AiReviewContext.tsx';
import { notificationService } from '../../services/notificationService.ts';
import ConfirmModal from '../common/ConfirmModal.tsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { latestReview } = useAiReview();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  useEffect(() => {
    let interval: any;
    
    const updateUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (err) {
          console.error('Failed to update unread count');
        }
      }
    };

    updateUnreadCount();
    if (isAuthenticated) {
      interval = setInterval(updateUnreadCount, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('Successfully logged out. See you soon!');
  };

  return (
    <>
      <nav 
        className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm px-4"
        style={{ backgroundColor: 'var(--card-surface)', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}
      >
        <Link className="navbar-brand" to="/">
          <img src="/images/logo.svg" alt="Logo" height="30" className="d-inline-block align-text-top me-2" />
          <span className="align-middle fw-bold text-primary">PortfoliQue</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => { setIsNavCollapsed(!isNavCollapsed); }}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/portfolios')}`} to="/portfolios" onClick={() => setIsNavCollapsed(true)}>Explore</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/portfolios/new')}`} to="/portfolios/new" onClick={() => setIsNavCollapsed(true)}>Add Work</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard" onClick={() => setIsNavCollapsed(true)}>Dashboard</Link>
                </li>
                {user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/admin')}`} to="/admin" onClick={() => setIsNavCollapsed(true)}>Admin</Link>
                  </li>
                )}
                {latestReview && (
                  <li className="nav-item me-2">
                    <Link to={`/portfolios/ai-reviews/${latestReview.id}`} onClick={() => setIsNavCollapsed(true)} style={{ textDecoration: 'none' }}>
                      {latestReview.status === 'IN_PROGRESS' && (
                        <span className="badge bg-warning text-dark px-2 py-1.5 shadow-sm d-flex align-items-center">
                          <i className="fas fa-spinner fa-spin me-1"></i> Running Audit...
                        </span>
                      )}
                      {latestReview.status === 'COMPLETED' && (
                        <span className="badge bg-success px-2 py-1.5 shadow-sm d-flex align-items-center">
                          <i className="fas fa-check-circle me-1"></i> Audit Ready
                        </span>
                      )}
                      {latestReview.status === 'FAILED' && (
                        <span className="badge bg-danger px-2 py-1.5 shadow-sm d-flex align-items-center">
                          <i className="fas fa-exclamation-triangle me-1"></i> Audit Failed
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className={`nav-link position-relative ${isActive('/notifications')}`} to="/notifications" onClick={() => setIsNavCollapsed(true)} title="Notifications">
                    <i className="fas fa-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute translate-middle badge rounded-pill bg-danger shadow-sm" style={{ top: '10px', left: '85%' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    id="profileDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle fs-5"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" aria-labelledby="profileDropdown">
                    <li>
                      <Link className="dropdown-item py-2" to="/profile" onClick={() => setIsNavCollapsed(true)}>
                        <i className="fas fa-user me-2 text-muted"></i> View Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/profile/myreviews" onClick={() => setIsNavCollapsed(true)}>
                        <i className="fas fa-magic me-2 text-muted"></i> AI Audit History
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider opacity-50" /></li>
                    <li>
                      <a 
                        className="dropdown-item py-2 text-danger" 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); setIsNavCollapsed(true); }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login" onClick={() => setIsNavCollapsed(true)}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/register')}`} to="/register" onClick={() => setIsNavCollapsed(true)}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <ConfirmModal
        show={showLogoutModal}
        title="Confirm Logout"
        body="Are you sure you want to log out?"
        confirmText="Logout"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
