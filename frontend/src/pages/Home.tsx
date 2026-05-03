import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="main-content-area fade-in">
      <div className="container mt-4">
        {/* Hero Section */}
        <div className="row hero-section align-items-center mb-5">
          <div className="col-lg-6 hero-content">
            <h1 className="display-4 fw-bold mb-3">Get Real Feedback. Build a Better Portfolio.</h1>
            <p className="lead mb-4">
              Stop guessing what recruiters want to see. Submit your portfolio and get structured,
              actionable feedback from a community of developers and designers just like you.
            </p>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Link to="/portfolios" className="btn btn-primary btn-lg px-4">
                Browse Portfolios <i className="fas fa-arrow-right ms-2"></i>
              </Link>
              {!isAuthenticated && (
                <>
                  <Link to="/register" className="btn btn-outline-primary btn-lg px-4">
                    Sign Up
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="col-lg-6 hero-illustration mt-4 mt-lg-0">
            <div className="card shadow-lg border-0 overflow-hidden rounded-4">
              <div className="position-relative">
                <img 
                  src="/images/professor-portfolio.png" 
                  alt="Prof. Dr. Mohammad Ubaidullah Bokhari Portfolio" 
                  className="img-fluid w-100" 
                  style={{ objectFit: 'cover', maxHeight: '320px' }}
                />
                <div className="position-absolute top-0 start-0 m-3">
                  <span className="badge bg-primary shadow-sm px-3 py-2">Featured Portfolio</span>
                </div>
              </div>
              <div className="card-body bg-white p-4">
                <h4 className="fw-bold mb-1">Prof. Dr. Mohammad Ubaidullah Bokhari</h4>
                <p className="text-primary small mb-3 fw-semibold">Professor of Computer Science & Visionary Academic</p>
                
                <p className="card-text text-muted small mb-4">
                  Recipient of the <strong>Named Fellowship</strong> and <strong>Significant Contribution Awards</strong>. 
                  A distinguished leader in research and PhD supervision.
                </p>

                <div className="d-flex gap-2">
                  <a 
                    href="https://mu-bokhari.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary px-3 rounded-pill"
                  >
                    View Live Example <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                  <Link 
                    to="/portfolios/featured/bokhari" 
                    className="btn btn-sm btn-primary px-3 rounded-pill"
                  >
                    View Feedback <i className="fas fa-comments ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="feature-box h-100 p-4 rounded-4 shadow-sm border-0">
              <div className="text-primary mb-3">
                <i className="fas fa-rocket fa-2x"></i>
              </div>
              <h3 className="h4 fw-bold">How It Works</h3>
              <p className="text-muted">
                Simply sign up, submit a link to your portfolio, and tell the community what areas you
                need feedback on. It's that easy to start your journey to a job-ready portfolio.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="feature-box h-100 p-4 rounded-4 shadow-sm border-0">
              <div className="text-success mb-3">
                <i className="fas fa-users fa-2x"></i>
              </div>
              <h3 className="h4 fw-bold">The Community</h3>
              <p className="text-muted">
                Our platform is built on peer-to-peer feedback. Give back to the community by reviewing
                other portfolios, sharing your expertise, and helping others succeed.
              </p>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="feature-box h-100 p-4 rounded-4 shadow-sm border-0">
              <div className="text-info mb-3">
                <i className="fas fa-robot fa-2x"></i>
              </div>
              <h3 className="h4 fw-bold">AI-Powered Review</h3>
              <p className="text-muted">
                Our intelligent system analyzes your portfolio's design, layout, and content, providing a
                detailed report on areas for improvement. It's like having a personal design expert
                available 24/7.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="feature-box h-100 p-4 rounded-4 shadow-sm border-0">
              <div className="text-warning mb-3">
                <i className="fas fa-file-alt fa-2x"></i>
              </div>
              <h3 className="h4 fw-bold">Instant Summarization</h3>
              <p className="text-muted">
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
