import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center px-4">
      <div className="display-1 fw-bold text-primary mb-2">404</div>
      <h2 className="fw-bold mb-4">Oops! Page not found</h2>
      <p className="text-muted mb-5 lead max-w-500">
        The page you are looking for might have been moved, deleted, or never existed in the first place.
      </p>
      <Link to="/" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-sm transition-transform hover-up">
        Go Back Home
      </Link>
    </div>
  );
}
