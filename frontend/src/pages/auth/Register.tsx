import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time validation (ported from script.js)
  const validateUsername = (value: string): string => {
    const pattern = /^[a-z0-9_]+$/;
    if (value.length < 3) return 'Username must be at least 3 characters long.';
    if (!pattern.test(value)) return 'Username can only contain lowercase letters, numbers, and underscores.';
    return '';
  };

  const validateEmail = (value: string): string => {
    const pattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(value)) return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (value: string): string => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (value.length < 6) return 'Password must be at least 6 characters long.';
    if (!pattern.test(value)) return 'Password must contain at least one uppercase letter, one number, and one special character.';
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'username':
        setUsername(value);
        error = value ? validateUsername(value) : '';
        break;
      case 'email':
        setEmail(value);
        error = value ? validateEmail(value) : '';
        break;
      case 'fullName':
        setFullName(value);
        error = value.trim() === '' ? 'Please enter your full name.' : '';
        break;
      case 'password':
        setPassword(value);
        error = value ? validatePassword(value) : '';
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const getInputClass = (field: string): string => {
    const value = { username, email, fullName, password }[field as keyof typeof errors] || '';
    if (!value) return 'form-control';
    return `form-control ${errors[field] ? 'is-invalid' : 'is-valid'}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const fullNameError = !fullName.trim() ? 'Please enter your full name.' : '';
    const passwordError = validatePassword(password);

    const allErrors = {
      username: usernameError,
      email: emailError,
      fullName: fullNameError,
      password: passwordError,
    };
    setErrors(allErrors);

    if (Object.values(allErrors).some((e) => e !== '')) return;

    setIsSubmitting(true);
    try {
      const successMsg = await register({ username, email, fullName, password });
      toast.success(successMsg || 'Account created! Please check your email to verify your account.', {
        duration: 10000,
        icon: '📧'
      });
      navigate('/login');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setServerError('Registration failed. Please try again.');
        toast.error('Unable to complete registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 fade-in">
      <div className="row flex-grow-1 justify-content-center align-items-center">
        {/* Illustration Section */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
          <img
            src="/images/signup.svg"
            alt="Signup Illustration"
            className="img-fluid"
            style={{ maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>

        {/* Register Form Section */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4">
          <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%', borderRadius: '12px' }}>
            <div className="card-body">
              <h1
                className="card-title text-center mb-4"
                style={{ fontWeight: 700, color: 'var(--text-primary)' }}
              >
                Sign up
              </h1>

              {serverError && (
                <div className="alert alert-danger" role="alert">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className={getInputClass('username')}
                    autoFocus
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px 15px', borderColor: 'var(--border)' }}
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={getInputClass('email')}
                    required
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px 15px', borderColor: 'var(--border)' }}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className={getInputClass('fullName')}
                    required
                    value={fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px 15px', borderColor: 'var(--border)' }}
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Password
                  </label>
                  <div className="input-group has-validation">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={getInputClass('password')}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                    />
                    <span
                      className="input-group-text"
                      style={{ cursor: 'pointer', borderRadius: '0 8px 8px 0' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </span>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>
                <div className="d-grid gap-2 mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary shadow-sm"
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing up...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <span style={{ color: 'var(--text-secondary)' }}>Already have an account?</span>
                <br />
                <Link to="/login" className="btn btn-outline-primary mt-2">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
