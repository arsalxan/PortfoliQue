import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import { feedbackService } from '../../services/feedbackService.ts';
import type { Portfolio } from '../../types/portfolio.ts';
import type { FeedbackRequest } from '../../types/feedback.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.tsx';

export default function FeedbackCreate() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<FeedbackRequest>({
    design: '',
    responsiveness: '',
    content: '',
    uxFlow: '',
    accessibility: '',
    technicalPerformance: '',
    additional: ''
  });

  useEffect(() => {
    if (id) {
      portfolioService.getPortfolioById(parseInt(id))
        .then(setPortfolio)
        .catch(() => setError('Failed to load portfolio.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (portfolio && currentUser && portfolio.userId === currentUser.id) {
      toast.error("You cannot review your own portfolio.");
      navigate(`/portfolios/${id}/feedbacks`);
    }
  }, [portfolio, currentUser, navigate, id]);

  const handleInputChange = (field: keyof FeedbackRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getValidationClass = (value?: string) => {
    if (!value) return '';
    return value.length >= 20 ? 'is-valid border-success' : 'border-light-subtle';
  };

  const isValid = Object.values(formData).some(value => (value || '').length >= 20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      await feedbackService.createFeedback(parseInt(id), formData);
      toast.success('Feedback submitted successfully!');
      navigate(`/portfolios/${id}/feedbacks`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
      toast.error('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const fields: { id: keyof FeedbackRequest; label: string; icon: string; placeholder: string }[] = [
    { id: 'design', label: 'Design & Aesthetics', icon: 'fa-palette', placeholder: 'Visual style, typography, color palette...' },
    { id: 'responsiveness', label: 'Responsiveness', icon: 'fa-mobile-alt', placeholder: 'Mobile layout, tablet adaptability...' },
    { id: 'content', label: 'Content Quality', icon: 'fa-font', placeholder: 'Clarity, professional tone, engagement...' },
    { id: 'uxFlow', label: 'UX & Navigation', icon: 'fa-route', placeholder: 'User flow, ease of use, logic...' },
    { id: 'accessibility', label: 'Accessibility', icon: 'fa-universal-access', placeholder: 'Contrast, alt text, ARIA roles...' },
    { id: 'technicalPerformance', label: 'Performance', icon: 'fa-bolt', placeholder: 'Load speed, animations, responsiveness...' },
    { id: 'additional', label: 'Additional Notes', icon: 'fa-sticky-note', placeholder: 'Any other observations?' },
  ];

  return (
    <div className="container-fluid py-5 bg-light-subtle min-vh-100">
      <div className="container">
        <div className="row g-4 justify-content-center">
          
          {/* Portfolio Sidebar */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '80px' }}>
              <div className="d-flex align-items-center mb-3">
                <Link to={`/portfolios/${id}/feedbacks`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="fas fa-arrow-left me-2"></i>Back
                </Link>
                <h5 className="mb-0 fw-bold ms-3">Reviewing Portfolio</h5>
              </div>
              
              {portfolio && (
                <div className="mb-4">
                  <PortfolioCard portfolio={portfolio} />
                </div>
              )}

              <div className="card border-0 shadow-sm bg-white overflow-hidden border-start border-primary border-4">
                <div className="card-body p-4 position-relative">
                  <i className="fas fa-lightbulb position-absolute opacity-10 end-0 bottom-0 mb-n2 me-n2 text-primary" style={{ fontSize: '80px' }}></i>
                  <h6 className="fw-bold mb-3 text-primary"><i className="fas fa-info-circle me-2"></i>Pro-Tip</h6>
                  <p className="small mb-0 text-secondary">
                    High-quality feedback helps creators grow. Focus on constructive criticism and suggest actionable improvements.
                  </p>
                  <hr className="my-3 opacity-10" />
                  <p className="small fw-semibold text-dark mb-0">
                    * Requirement: At least 20 chars in 1 section.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="mb-5">
                  <h1 className="h3 fw-bold text-dark mb-2">Share Your Expertise</h1>
                  <p className="text-muted">Analyze the work and provide detailed feedback across these categories.</p>
                </div>

                {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {fields.map((field) => (
                      <div key={field.id} className="col-12">
                        <div className="d-flex justify-content-between align-items-end mb-2">
                          <label className="form-label fw-bold small text-primary text-uppercase mb-0">
                            <i className={`fas ${field.icon} me-2`}></i>{field.label}
                          </label>
                          <span className={`small ${(formData[field.id]?.length || 0) >= 20 ? 'text-success' : 'text-muted'}`}>
                            {(formData[field.id]?.length || 0)}/20+
                          </span>
                        </div>
                        <textarea
                          className={`form-control border-2 rounded-3 p-3 ${getValidationClass(formData[field.id])}`}
                          rows={3}
                          placeholder={field.placeholder}
                          value={formData[field.id]}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          style={{ fontSize: '0.95rem' }}
                        ></textarea>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-top">
                    <div className="row align-items-center">
                      <div className="col-md-7 mb-3 mb-md-0">
                        {!isValid && (
                          <div className="d-flex align-items-center text-danger small">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Please write at least 20 characters in any one section.
                          </div>
                        )}
                        {isValid && (
                          <div className="d-flex align-items-center text-success small fw-bold">
                            <i className="fas fa-check-circle me-2"></i>
                            Ready to submit!
                          </div>
                        )}
                      </div>
                      <div className="col-md-5 text-md-end">
                        <button
                          type="submit"
                          className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow-sm"
                          disabled={isSubmitting || !isValid}
                        >
                          {isSubmitting ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                          ) : (
                            <><i className="fas fa-paper-plane me-2"></i>Post Feedback</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
