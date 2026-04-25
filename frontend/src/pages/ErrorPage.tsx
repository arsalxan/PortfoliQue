import { Link } from 'react-router-dom';

export default function ErrorPage({ message = 'An unexpected error occurred.' }: { message?: string }) {
  return (
    <div className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center px-4">
      <div className="bg-danger-subtle text-danger rounded-circle p-4 mb-4">
        <i className="fas fa-exclamation-triangle fa-3x"></i>
      </div>
      <h2 className="fw-bold mb-3">Something went wrong</h2>
      <p className="text-muted mb-5 lead">
        {message}
      </p>
      <div className="d-flex gap-3">
        <button className="btn btn-outline-secondary px-4 py-2 rounded-pill" onClick={() => window.location.reload()}>
          Try Again
        </button>
        <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill fw-bold">
          Go Home
        </Link>
      </div>
    </div>
  );
}
