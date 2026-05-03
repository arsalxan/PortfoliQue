import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { feedbackService } from '../../services/feedbackService.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Feedback } from '../../types/feedback.ts';
import Skeleton from '../../components/common/Skeleton';

export default function FeedbackDetail() {
  const { portfolioId, feedbackId } = useParams<{ portfolioId: string; feedbackId: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (feedbackId) {
      feedbackService.getFeedbackById(parseInt(feedbackId))
        .then(setFeedback)
        .catch(() => setError('Failed to load feedback details.'))
        .finally(() => setLoading(false));
    }
  }, [feedbackId]);

  const handleDelete = async () => {
    if (!feedbackId || !window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await feedbackService.deleteFeedback(parseInt(feedbackId));
      navigate(`/portfolios/${portfolioId}/feedbacks`);
    } catch (err) {
      alert('Failed to delete feedback.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 fade-in">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow border-0 rounded-3 overflow-hidden">
              <div className="card-header bg-primary py-3 d-flex justify-content-between align-items-center">
                <div className="skeleton" style={{ width: '150px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                <div className="skeleton" style={{ width: '60px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              </div>
              <div className="card-body p-0">
                <div className="p-4 bg-light border-bottom">
                  <Skeleton width="60%" height="24px" className="mb-2" />
                  <Skeleton width="30%" height="14px" />
                </div>
                <div className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <Skeleton circle width="50px" height="50px" className="me-3" />
                    <div>
                      <Skeleton width="120px" height="20px" className="mb-2" />
                      <Skeleton width="180px" height="14px" />
                    </div>
                  </div>
                  <div className="border rounded">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border-bottom">
                        <Skeleton width="100px" height="18px" className="mb-3" />
                        <Skeleton height="14px" className="mb-2" />
                        <Skeleton height="14px" width="80%" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{error || 'Feedback not found.'}</div>
        <div className="text-center">
          <Link to={`/portfolios/${portfolioId}/feedbacks`} className="btn btn-primary">Back to Feedbacks</Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === feedback.userId;

  const sections = [
    { label: 'Design', value: feedback.design, icon: 'fa-palette' },
    { label: 'Responsiveness', value: feedback.responsiveness, icon: 'fa-mobile-alt' },
    { label: 'Content/Copywriting', value: feedback.content, icon: 'fa-align-left' },
    { label: 'UX Flow', value: feedback.uxFlow, icon: 'fa-stream' },
    { label: 'Accessibility', value: feedback.accessibility, icon: 'fa-universal-access' },
    { label: 'Technical Performance', value: feedback.technicalPerformance, icon: 'fa-cogs' },
    { label: 'Additional Thoughts', value: feedback.additional, icon: 'fa-plus-circle' },
  ].filter(s => s.value && s.value.trim() !== '');

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow border-0 rounded-3 overflow-hidden">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0 fw-bold"><i className="fas fa-info-circle me-2"></i> Feedback Details</h2>
              <Link to={`/portfolios/${portfolioId}/feedbacks`} className="btn btn-sm btn-light">
                <i className="fas fa-arrow-left me-1"></i> Back
              </Link>
            </div>
            
            <div className="card-body p-0">
              {/* Portfolio Recap Mini-Section */}
              <div className="p-4 bg-light border-bottom">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="h5 fw-bold mb-1">Portfolio: {feedback.portfolioOwnerFullName}</h4>
                    <p className="text-muted small mb-0">Owner: @{feedback.portfolioOwnerUsername}</p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <Link to={`/portfolios/${portfolioId}/feedbacks`} className="btn btn-sm btn-outline-primary">
                      View Portfolio
                    </Link>
                  </div>
                </div>
              </div>

              {/* Feedback Author Info */}
              <div className="p-4 bg-white">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
                    {feedback.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{feedback.fullName}</h5>
                    <p className="text-muted small mb-0">Submitted on {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Feedback Content Sections */}
                <div className="list-group list-group-flush border rounded">
                  {sections.map((section, idx) => (
                    <div key={idx} className="list-group-item p-4">
                      <h6 className="fw-bold text-primary mb-2">
                        <i className={`fas ${section.icon} me-2`}></i> {section.label}
                      </h6>
                      <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {section.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="card-footer bg-white p-4 border-top-0 d-flex justify-content-between align-items-center">
                <Link to={`/portfolios/${portfolioId}/feedbacks`} className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2"></i> Back to All Feedbacks
                </Link>
                {isAuthor && (
                  <button onClick={handleDelete} className="btn btn-danger">
                    <i className="fas fa-trash-alt me-2"></i> Delete Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
