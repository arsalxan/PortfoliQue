import { Link } from 'react-router-dom';
import type { Feedback } from '../../types/feedback.ts';

interface FeedbackSummaryCardProps {
  feedback: Feedback;
  onDelete: (id: number) => void;
}

export default function FeedbackSummaryCard({ feedback, onDelete }: FeedbackSummaryCardProps) {
  // Combine non-empty feedback fields to show a preview
  const previewText = [
    feedback.design,
    feedback.responsiveness,
    feedback.content,
    feedback.uxFlow,
    feedback.accessibility,
    feedback.technicalPerformance,
    feedback.additional
  ].filter(Boolean).join(' | ');

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 feedback-card overflow-hidden">
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-primary fw-bold">
            Feedback for {feedback.portfolioOwnerFullName}'s Portfolio
          </h6>
          <p className="card-text text-muted small text-truncate-2-lines mb-3">
            {previewText || 'No detailed comments provided.'}
          </p>
          <div className="d-flex gap-2">
            <Link 
              to={`/portfolios/${feedback.portfolioId}/feedbacks/${feedback.id}`} 
              className="btn btn-sm btn-outline-primary flex-grow-1"
            >
              View
            </Link>
            <button 
              onClick={() => onDelete(feedback.id)}
              className="btn btn-sm btn-outline-danger"
              title="Delete Feedback"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        {/* Screenshot at the bottom as per requirements */}
        <div className="portfolio-card-img-container" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }}>
          <img 
            src={`/images/defaultscreenshot.svg`} // Ideally we'd have the screenshot in FeedbackResponse too
            className="portfolio-card-img" 
            alt="Portfolio Preview"
            style={{ opacity: 0.8 }}
          />
          <div className="position-absolute bottom-0 start-0 p-2 w-100 bg-dark bg-opacity-50 text-white small text-center">
            @{feedback.portfolioOwnerUsername}
          </div>
        </div>
      </div>
    </div>
  );
}
