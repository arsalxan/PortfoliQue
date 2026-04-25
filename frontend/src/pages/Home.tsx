import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="main-content-area fade-in">
      <div className="container mt-4">
        {/* Hero Section */}
        <div className="row hero-section align-items-center mb-5">
          <div className="col-lg-7 hero-content">
            <h1 className="display-4 fw-bold">Get Real Feedback. Build a Better Portfolio.</h1>
            <p className="lead">
              Stop guessing what recruiters want to see. Submit your portfolio and get structured,
              actionable feedback from a community of developers and designers just like you.
            </p>
            <Link to="/portfolios" className="btn btn-primary btn-lg me-2 mb-2 mb-lg-0">
              Browse Portfolios <i className="fas fa-arrow-right ms-2"></i>
            </Link>
            {!isAuthenticated && (
              <>
                <Link to="/register" className="btn btn-outline-primary btn-lg me-2 mb-2 mb-lg-0">
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg mb-2 mb-lg-0">
                  Login
                </Link>
              </>
            )}
          </div>
          <div className="col-lg-5 hero-illustration mt-4 mt-lg-0">
            <img src="/images/homeimage.svg" alt="Portfolio Feedback Illustration" className="img-fluid" />
          </div>
        </div>

        {/* Feature Boxes Row 1 */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="feature-box">
              <i className="fas fa-rocket"></i>
              <h2>How It Works</h2>
              <p>
                Simply sign up, submit a link to your portfolio, and tell the community what areas you
                need feedback on. It's that easy to start your journey to a job-ready portfolio.
              </p>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="feature-box">
              <i className="fas fa-users"></i>
              <h2>The Community</h2>
              <p>
                Our platform is built on peer-to-peer feedback. Give back to the community by reviewing
                other portfolios, sharing your expertise, and helping others succeed.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Boxes Row 2 */}
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <div className="feature-box h-100">
              <i className="fas fa-robot fa-3x text-primary mb-3"></i>
              <h2>AI-Powered Review</h2>
              <p className="text-secondary">
                Our intelligent system analyzes your portfolio's design, layout, and content, providing a
                detailed report on areas for improvement. It's like having a personal design expert
                available 24/7.
              </p>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="feature-box h-100">
              <i className="fas fa-file-alt fa-3x text-primary mb-3"></i>
              <h2>Instant Summarization</h2>
              <p className="text-secondary">
                Get a concise 3-line summary of the feedbacks you receive on your portfolio. Our AI cuts
                through the noise to give you the most important takeaways at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
