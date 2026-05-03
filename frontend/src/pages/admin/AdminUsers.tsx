import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { UserResponse } from '../../types/user';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/common/Skeleton';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers(search, page);
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own admin account from here.');
      return;
    }

    if (window.confirm('WARNING: Are you sure you want to delete this user? This will remove all their portfolios and feedbacks.')) {
      try {
        await adminService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        <AdminSidebar />
        <div className="col-md-10 p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-bold text-dark mb-1">Manage Users</h1>
              <p className="text-muted">View and manage all registered platform members.</p>
            </div>
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
                  placeholder="Search by username, email or name..." 
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
                    <th className="px-4 py-3 border-0">User</th>
                    <th className="py-3 border-0">Email</th>
                    <th className="py-3 border-0">Role</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && page === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <Skeleton circle width="40px" height="40px" className="me-3" />
                            <div>
                              <Skeleton width="120px" height="18px" />
                              <Skeleton width="80px" height="12px" className="mt-2" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3"><Skeleton width="150px" height="15px" /></td>
                        <td className="py-3"><Skeleton width="60px" height="20px" /></td>
                        <td className="py-3"><Skeleton width="60px" height="20px" /></td>
                        <td className="px-4 py-3 text-end"><Skeleton width="32px" height="32px" className="ms-auto" /></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No users found match your search.</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-info-subtle rounded-circle p-2 me-3 text-info">
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <div className="fw-bold">{u.fullName}</div>
                              <small className="text-muted">@{u.username}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">
                          <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-success-subtle text-success">Active</span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-3"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.role === 'ADMIN'}
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
        </div>
      </div>
    </div>
  );
}
