import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import { feedbackService } from '../../services/feedbackService.ts';
import type { Portfolio } from '../../types/portfolio.ts';
import type { FeedbackRequest } from '../../types/feedback.ts';
import PortfolioCard from '../../components/portfolio/PortfolioCard.tsx';

export default function FeedbackCreate() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleInputChange = (field: keyof FeedbackRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getValidationClass = (value?: string) => {
    if (!value) return '';
    return value.length >= 20 ? 'is-valid border-success shadow-sm' : 'is-invalid border-danger';
  };

  const isValid = Object.values(formData).some(value => (value || '').length >= 20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      await feedbackService.createFeedback(parseInt(id), formData);
      navigate(`/portfolios/${id}/feedbacks`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
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

  const fields: { id: keyof FeedbackRequest; label: string; placeholder: string }[] = [
    { id: 'design', label: 'Design', placeholder: 'Visual aesthetics, layout, typography, color palette...' },
    { id: 'responsiveness', label: 'Responsiveness', placeholder: 'How it works on mobile, tablet, and desktop?' },
    { id: 'content', label: 'Content/Copywriting', placeholder: 'Is the text clear, professional, and engaging?' },
    { id: 'uxFlow', label: 'UX Flow', placeholder: 'Navigation, ease of use, call-to-actions...' },
    { id: 'accessibility', label: 'Accessibility', placeholder: 'Alt text, contrast, screen reader compatibility...' },
    { id: 'technicalPerformance', label: 'Technical Performance', placeholder: 'Load speed, animations, clean code impressions...' },
    { id: 'additional', label: 'Additional Thoughts', placeholder: 'Anything else you noticed?' },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="feedback-page-container">
        {/* Left Side: Portfolio Card */}
        <div className="portfolio-card-container">
          <div className="mb-3">
            <Link to={`/portfolios/${id}/feedbacks`} className="btn btn-sm btn-outline-secondary mb-3">
              <i className="fas fa-arrow-left me-2"></i> Back to Feedbacks
            </Link>
            <h2 className="h4 fw-bold mb-3">You're Reviewing</h2>
          </div>
          {portfolio && <PortfolioCard portfolio={portfolio} />}
          <div className="mt-4 p-3 bg-light rounded border">
            <h6 className="fw-bold small text-primary mb-2"><i className="fas fa-info-circle me-1"></i> Feedback Requirements:</h6>
            <p className="small text-muted mb-0">
              To ensure high-quality reviews, at least one section must contain **at least 20 characters**.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="feedbacks-container">
          <div className="card shadow-sm border-0 mb-5">
            <div className="card-header bg-primary text-white p-3">
              <h2 className="h5 mb-0 fw-bold"><i className="fas fa-pen-nib me-2"></i> Submit Feedback</h2>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger mb-4">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {fields.map((field) => (
                    <div key={field.id} className="col-12">
                      <label className="form-label fw-bold small text-secondary uppercase tracking-wider">
                        {field.label}
                      </label>
                      <textarea
                        className={`form-control ${getValidationClass(formData[field.id])}`}
                        rows={3}
                        placeholder={field.placeholder}
                        value={formData[field.id]}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        style={{ transition: 'all 0.3s ease' }}
                      ></textarea>
                      {formData[field.id] && (formData[field.id] || '').length < 20 && (
                        <div className="small text-danger mt-1">
                          {20 - (formData[field.id] || '').length} more characters needed for this section to count.
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="d-grid gap-2 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-bold shadow-sm py-3"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</>
                    ) : (
                      <><i className="fas fa-paper-plane me-2"></i> Submit Feedback</>
                    )}
                  </button>
                  {!isValid && (
                    <div className="text-center small text-danger mt-2">
                      Please provide at least one meaningful feedback section (20+ chars).
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
