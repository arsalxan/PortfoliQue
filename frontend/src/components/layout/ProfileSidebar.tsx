import { NavLink } from 'react-router-dom';

export default function ProfileSidebar() {
  return (
    <div className="col-lg-2 col-md-1 d-none d-md-flex flex-column align-items-center align-items-lg-start sidebar shadow-sm p-3">
      <NavLink to="/dashboard" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="Dashboard">
        <i className="fas fa-th-large me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">Dashboard</span>
      </NavLink>
      <NavLink end to="/profile" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="My Profile">
        <i className="fas fa-user me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">My Profile</span>
      </NavLink>
      <NavLink to="/portfolios/new" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="Add Portfolio">
        <i className="fas fa-plus-circle me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">Add Portfolio</span>
      </NavLink>
      <NavLink to="/profile/myportfolios" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="My Portfolios">
        <i className="fas fa-briefcase me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">My Portfolios</span>
      </NavLink>
      <NavLink to="/profile/myfeedbacks" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="My Feedbacks">
        <i className="fas fa-comments me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">My Feedbacks</span>
      </NavLink>
      <NavLink to="/profile/myreviews" className={({isActive}) => `sidebar-link d-flex align-items-center w-100 mb-3 text-decoration-none ${isActive ? 'active' : ''}`} title="AI Audits">
        <i className="fas fa-magic me-lg-3 fs-5"></i>
        <span className="d-none d-lg-inline fw-semibold">AI Audits</span>
      </NavLink>
    </div>
  );
}
