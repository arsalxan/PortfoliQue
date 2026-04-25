import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username, password });
      toast.success('Welcome back to PortfoliQue!');
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string, error?: string } } };
        setError(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please try again.');
        toast.error('Unable to connect to service.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1 justify-content-center align-items-center">
        {/* Illustration Section */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
          <img
            src="/images/login.svg"
            alt="Login Illustration"
            className="img-fluid"
            style={{ maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>

        {/* Login Form Section */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
          <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%', borderRadius: '12px' }}>
            <div className="card-body">
              <h1
                className="card-title text-center mb-4"
                style={{ fontWeight: 700, color: 'var(--text-primary)' }}
              >
                Log in
              </h1>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label
                    htmlFor="username"
                    className="form-label"
                    style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px 15px', borderColor: 'var(--border)' }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="password"
                    className="form-label"
                    style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-control"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ borderRadius: '8px 0 0 8px', padding: '10px 15px', borderColor: 'var(--border)' }}
                    />
                    <span
                      className="input-group-text"
                      style={{ cursor: 'pointer', borderRadius: '0 8px 8px 0' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </span>
                  </div>
                </div>
                <div className="d-grid gap-2 mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Log in'
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <span style={{ color: 'var(--text-secondary)' }}>Don't have an account?</span>
                <br />
                <Link to="/register" className="btn btn-outline-primary mt-2">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
