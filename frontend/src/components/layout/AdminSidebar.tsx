import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <div className="col-md-2 d-none d-md-block sidebar shadow-sm p-0">
      <div className="p-4 border-bottom bg-primary text-white mb-4">
        <h5 className="mb-0 fw-bold"><i className="fas fa-user-shield me-2"></i> Admin Panel</h5>
      </div>
      <div className="px-3">
        <NavLink to="/admin" end className={({isActive}) => `admin-nav-link d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none ${isActive ? 'active bg-primary text-white' : 'text-muted'}`}>
          <i className="fas fa-chart-pie me-3 fs-5"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={({isActive}) => `admin-nav-link d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none ${isActive ? 'active bg-primary text-white' : 'text-muted'}`}>
          <i className="fas fa-users me-3 fs-5"></i>
          <span>Manage Users</span>
        </NavLink>
        <NavLink to="/admin/portfolios" className={({isActive}) => `admin-nav-link d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none ${isActive ? 'active bg-primary text-white' : 'text-muted'}`}>
          <i className="fas fa-briefcase me-3 fs-5"></i>
          <span>Portfolios</span>
        </NavLink>
        <NavLink to="/admin/feedbacks" className={({isActive}) => `admin-nav-link d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none ${isActive ? 'active bg-primary text-white' : 'text-muted'}`}>
          <i className="fas fa-comments me-3 fs-5"></i>
          <span>Feedbacks</span>
        </NavLink>
      </div>
    </div>
  );
}
