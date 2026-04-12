import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { notificationService } from '../../services/notificationService.ts';
import ConfirmModal from '../common/ConfirmModal.tsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getUnreadCount()
        .then((data) => setUnreadCount(data.count))
        .catch(() => setUnreadCount(0));
    }
  }, [isAuthenticated, location.pathname]);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <Link className="navbar-brand ms-3" to="/">
          <img src="/images/logo.svg" alt="Logo" height="30" className="d-inline-block align-text-top me-2" />
          <span className="align-middle">PortfoliQue</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/portfolios')}`} to="/portfolios">Portfolios</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/portfolios/new')}`} to="/portfolios/new">Add Portfolio</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">Dashboard</Link>
                </li>
                {user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/admin')}`} to="/admin">Admin</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/notifications')}`} to="/notifications">
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="badge bg-danger">{unreadCount}</span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/profile')}`} to="/profile">My Profile</Link>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}
                  >
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/register')}`} to="/register">Register</Link>
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
