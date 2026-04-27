import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService.ts';
import type { UserProfileResponse } from '../../types/user';
import ProfileSidebar from '../../components/layout/ProfileSidebar';

type Tab = 'overview' | 'edit';

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setEmail(data.email);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify({
      fullName,
      email,
      currentPassword,
      newPassword
    })], { type: 'application/json' }));

    if (selectedFile) {
      formData.append('dp', selectedFile);
    }

    try {
      const updatedProfile = await userService.updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Account deleted successfully.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || isDeleting) return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        <ProfileSidebar />
        <div className="col-lg-10 col-md-11 p-4 text-center py-5">
          <div className="py-5 mt-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="fw-bold">{isDeleting ? 'Deleting your account...' : 'Loading profile...'}</h4>
            <p className="text-muted">Please wait a moment.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const avatarSrc = previewImage || profile?.profilePicture;

  return (
    <div className="container-fluid profile-page-bg">
      <div className="row g-0">
        {/* Shared sidebar — same as MyPortfolios & MyFeedbacks */}
        <ProfileSidebar />

        {/* Main content */}
        <div className="col-lg-10 col-md-11 p-4">

          {/* Page header */}
          <div className="mb-4">
            <h1 className="fw-bold text-primary mb-1">My Profile</h1>
            <p className="text-muted">View and manage your account information.</p>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4 border-bottom">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'overview' ? 'active' : 'text-muted'}`}
                onClick={() => { setActiveTab('overview'); setError(''); setSuccess(''); }}
              >
                <i className="fas fa-id-card me-2" />Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'edit' ? 'active' : 'text-muted'}`}
                onClick={() => setActiveTab('edit')}
              >
                <i className="fas fa-pen me-2" />Edit Profile
              </button>
            </li>
          </ul>

          {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="row g-4">
              {error && <div className="col-12"><div className="alert alert-danger mb-0">{error}</div></div>}
              {/* Avatar + stats card */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm text-center py-5 h-100">
                  <div className="card-body d-flex flex-column align-items-center">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="rounded-circle border shadow-sm mb-3"
                        style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="fas fa-user-circle text-muted mb-3" style={{ fontSize: '130px' }} />
                    )}
                    <h4 className="fw-bold mb-0">{profile?.fullName}</h4>
                    <p className="text-muted mb-1">@{profile?.username}</p>
                    <span className={`badge mb-4 ${profile?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                      {profile?.role}
                    </span>

                    <div className="d-flex gap-3 mb-4 w-100 justify-content-center">
                      <div className="p-3 bg-light rounded-3 text-center flex-fill">
                        <h4 className="fw-bold text-primary mb-0">{profile?.portfolioCount ?? 0}</h4>
                        <small className="text-muted">Portfolios</small>
                      </div>
                      <div className="p-3 bg-light rounded-3 text-center flex-fill">
                        <h4 className="fw-bold text-primary mb-0">{profile?.feedbackCount ?? 0}</h4>
                        <small className="text-muted">Feedbacks</small>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary w-100 mb-2"
                      onClick={() => setActiveTab('edit')}
                    >
                      <i className="fas fa-pen me-2" />Edit Profile
                    </button>

                    {profile?.role !== 'ADMIN' && (
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <i className="fas fa-trash-alt me-2" />Delete Account
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info + quick links */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Account Details</h5>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label text-muted small fw-bold">USERNAME</label>
                        <div className="form-control bg-light text-muted">@{profile?.username}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-muted small fw-bold">FULL NAME</label>
                        <div className="form-control bg-light">{profile?.fullName}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-muted small fw-bold">EMAIL</label>
                        <div className="form-control bg-light">{profile?.email}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-muted small fw-bold">ROLE</label>
                        <div className="form-control bg-light">{profile?.role}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Quick Actions</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <Link to="/portfolios/new" className="btn btn-outline-primary">
                        <i className="fas fa-plus me-2" />Add Portfolio
                      </Link>
                      <Link to="/profile/myportfolios" className="btn btn-outline-secondary">
                        <i className="fas fa-briefcase me-2" />My Portfolios
                      </Link>
                      <Link to="/profile/myfeedbacks" className="btn btn-outline-secondary">
                        <i className="fas fa-comments me-2" />My Feedbacks
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'edit' && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Edit Profile</h5>

                    {error && <div className="alert alert-danger mb-4">{error}</div>}
                    {success && <div className="alert alert-success mb-4">{success}</div>}

                    <form onSubmit={handleUpdate}>
                      {/* Avatar upload */}
                      <div className="mb-4 text-center">
                        <div
                          className="profile-dp-upload-area position-relative d-inline-block"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ cursor: 'pointer' }}
                        >
                          {avatarSrc ? (
                            <img src={avatarSrc} className="profile-dp-preview rounded-circle" alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                              <i className="fas fa-camera text-muted fa-2x" />
                            </div>
                          )}
                          <div className="profile-dp-overlay position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center text-white small">
                            Change
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="d-none" accept="image/*" />
                        <div className="mt-2 small text-muted">Click to upload new avatar</div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">USERNAME</label>
                        <input type="text" className="form-control bg-light" value={profile?.username} disabled />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">FULL NAME</label>
                        <input type="text" className="form-control h-45" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                        <input type="email" className="form-control h-45" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>

                      <hr className="my-4" />
                      <h6 className="fw-bold mb-3 text-muted">Change Password <span className="fw-normal">(optional)</span></h6>

                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">CURRENT PASSWORD</label>
                        <input type="password" className="form-control h-45" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required only to change password" />
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label text-muted small fw-bold">NEW PASSWORD</label>
                          <input type="password" className="form-control h-45" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted small fw-bold">CONFIRM NEW PASSWORD</label>
                          <input type="password" className="form-control h-45" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary px-4 h-45" disabled={updating}>
                          {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-light px-4 h-45" onClick={() => { setActiveTab('overview'); setError(''); setSuccess(''); }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">Delete Account</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body p-4">
                <p>Are you absolutely sure you want to delete your account?</p>
                <div className="alert alert-warning small">
                  <strong>Warning:</strong> This action is irreversible. All your portfolios, feedbacks, and history will be lost forever.
                </div>
              </div>
              <div className="modal-footer border-0 p-3">
                <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)} disabled={updating}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={updating}>
                  {updating ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</>
                  ) : (
                    'Yes, Delete My Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
