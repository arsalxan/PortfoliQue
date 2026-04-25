import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminDashboardResponse } from '../../types/admin';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container-fluid"><div className="row"><AdminSidebar /><div className="col-md-10 text-center py-5"><div className="spinner-border text-primary"></div></div></div></div>;

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        <AdminSidebar />
        
        <div className="col-md-10 p-5">
          <div className="mb-5">
            <h1 className="fw-bold text-dark mb-1">Administrative Dashboard</h1>
            <p className="text-muted">Overview of platform health and community activity.</p>
          </div>

          <div className="row g-4">
            {/* Stat Card: Users */}
            <div className="col-md-4">
              <Link to="/admin/users" className="text-decoration-none">
                <div className="card border-0 shadow-sm transition-transform hover-up h-100">
                  <div className="card-body p-4 text-center">
                    <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-users fs-3"></i>
                    </div>
                    <h2 className="fw-bold mb-1">{stats?.totalUsers}</h2>
                    <p className="text-muted mb-0">Total Registered Users</p>
                  </div>
                  <div className="card-footer bg-white border-0 text-center pb-4 text-primary small fw-bold">
                    Manage Users <i className="fas fa-chevron-right ms-1"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Stat Card: Portfolios */}
            <div className="col-md-4">
              <Link to="/admin/portfolios" className="text-decoration-none">
                <div className="card border-0 shadow-sm transition-transform hover-up h-100">
                  <div className="card-body p-4 text-center">
                    <div className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-briefcase fs-3"></i>
                    </div>
                    <h2 className="fw-bold mb-1">{stats?.totalPortfolios}</h2>
                    <p className="text-muted mb-0">Total Portfolios</p>
                  </div>
                  <div className="card-footer bg-white border-0 text-center pb-4 text-success small fw-bold">
                    Review Content <i className="fas fa-chevron-right ms-1"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Stat Card: Feedbacks */}
            <div className="col-md-4">
              <Link to="/admin/feedbacks" className="text-decoration-none">
                <div className="card border-0 shadow-sm transition-transform hover-up h-100">
                  <div className="card-body p-4 text-center">
                    <div className="bg-warning-subtle text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-comments fs-3"></i>
                    </div>
                    <h2 className="fw-bold mb-1">{stats?.totalFeedbacks}</h2>
                    <p className="text-muted mb-0">Total Feedbacks Given</p>
                  </div>
                  <div className="card-footer bg-white border-0 text-center pb-4 text-warning small fw-bold">
                    Moderate Reviews <i className="fas fa-chevron-right ms-1"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Info Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Admin Notes</h5>
                  <ul className="text-muted mb-0">
                    <li className="mb-2">Ensure all deletions are confirmed by referencing the unique ID.</li>
                    <li className="mb-2">Admin deletions are permanent and cannot be undone via this dashboard.</li>
                    <li>For user account recovery or role updates, please use the direct database CLI or contact technical support.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
