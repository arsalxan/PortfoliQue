import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../../services/authService.ts';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    authService
      .verifyEmail(token)
      .then((response) => {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      })
      .catch((err: unknown) => {
        setStatus('error');
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setMessage(axiosErr.response?.data?.message || 'Verification failed. The link may be expired.');
        } else {
          setMessage('Verification failed. Please try again.');
        }
      });
  }, [token]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4 text-center">
            {status === 'loading' && (
              <>
                <div className="spinner-border text-primary mx-auto mb-3" role="status">
                  <span className="visually-hidden">Verifying...</span>
                </div>
                <h4>Verifying your email...</h4>
              </>
            )}
            {status === 'success' && (
              <>
                <i className="fas fa-check-circle text-success fa-4x mb-3"></i>
                <h4 className="text-success">{message}</h4>
                <Link to="/login" className="btn btn-primary mt-3">
                  Go to Login
                </Link>
              </>
            )}
            {status === 'error' && (
              <>
                <i className="fas fa-times-circle text-danger fa-4x mb-3"></i>
                <h4 className="text-danger">{message}</h4>
                <Link to="/register" className="btn btn-outline-primary mt-3">
                  Try Again
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
