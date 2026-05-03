import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FeaturedPortfolio() {
  const [activeSummaries, setActiveSummaries] = useState<Record<number, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<number, boolean>>({});

  const professorData = {
    id: 999,
    title: "Prof. Dr. Mohammad Ubaidullah Bokhari",
    description: "Personal academic portfolio showcasing decades of research, publications, and visionary leadership in Computer Science.",
    url: "https://mu-bokhari.vercel.app/",
    imageUrl: "/images/professor-portfolio.png",
    username: "mu-bokhari",
    fullName: "Prof. Dr. Mohammad Ubaidullah Bokhari",
    category: "Academic",
    feedbackCount: 3,
    createdAt: "2024-01-01T10:00:00Z"
  };

  const featuredFeedbacks = [
    {
      id: 1,
      fullName: "Modassir Khan",
      username: "md_khan",
      createdAt: "2024-05-15T09:00:00Z",
      academicVision: "Dr. Bokhari's academic contributions are legendary, and this portfolio does them justice. It's a fitting digital archive for a visionary who has mentored hundreds of scholars.",
      design: "The minimalist design choice is excellent. It reflects the Professor's rigorous and precise approach to computer science research. One minor suggestion would be to increase the line-height in the long publication lists.",
      summary: "A respectful digital tribute to Dr. Bokhari's legendary career with a solid, minimalist academic design."
    },
    {
      id: 2,
      fullName: "Prof. Amit Sharma",
      username: "asharma_cs",
      createdAt: "2024-05-12T14:30:00Z",
      leadershipPraise: "It is an honor to review a portfolio from such a distinguished academic. His visionary leadership is well-represented by the clear organizational structure of this site.",
      uxFlow: "The navigation between teaching history and research archives is very intuitive. It reflects the Professor's own clarity in thought and professional execution.",
      summary: "Highlights the Professor's academic leadership and provides an intuitive, clear UX flow for complex research data."
    },
    {
      id: 3,
      fullName: "Elena Rodriguez",
      username: "elena_ux",
      createdAt: "2024-05-10T11:20:00Z",
      careerAuthority: "This portfolio sets the gold standard for how a senior academic should present their digital identity. It carries the weight of his authority in the field.",
      technicalExecution: "Solid technical implementation that matches the Professor's high standard for excellence. All links are verified, and the SEO structure is optimized for high visibility.",
      summary: "A technically perfect showcase that correctly carries the professional weight and authority of the Professor."
    }
  ];

  const handleSummarize = (id: number, summary: string) => {
    setLoadingSummaries(prev => ({ ...prev, [id]: true }));
    // Simulate AI processing time
    setTimeout(() => {
      setActiveSummaries(prev => ({ ...prev, [id]: summary }));
      setLoadingSummaries(prev => ({ ...prev, [id]: false }));
    }, 800);
  };

  return (
    <div className="container-fluid px-4 py-4 fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Back button */}
      <Link to="/portfolios" className="btn btn-sm btn-outline-secondary mb-4">
        <i className="fas fa-arrow-left me-2"></i> Back to Portfolios
      </Link>

      <div className="row g-4">
        
        {/* ── LEFT PANEL: Portfolio Info (sticky) ── */}
        <div className="col-lg-5">
          <div style={{ position: 'sticky', top: '72px' }}>
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-layer-group me-2 text-primary"></i>Portfolio Details
                </h5>
                
                {/* Simulated Portfolio Card */}
                <div className="card border-0 bg-light rounded-4 overflow-hidden shadow-sm">
                  <img 
                    src={professorData.imageUrl} 
                    alt={professorData.title} 
                    className="card-img-top w-100 shadow-sm" 
                    style={{ borderBottom: '1px solid var(--border)' }} 
                  />
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="badge bg-primary px-3 py-2 shadow-sm">Featured Portfolio</div>
                      <div className="d-flex gap-2">
                        <a 
                          href={professorData.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Visit <i className="fas fa-external-link-alt ms-1"></i>
                        </a>
                        <Link 
                          to="/portfolios/featured/bokhari/ai-review" 
                          className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-bold shadow-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="fas fa-robot me-1"></i> AI Review
                        </Link>
                      </div>
                    </div>
                    <h4 className="fw-bold mb-2 text-dark">{professorData.title}</h4>
                    <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>{professorData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Feedbacks ── */}
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="h4 fw-bold mb-0">Community Feedbacks</h2>
              <p className="text-muted small mb-0">Reviews honoring a visionary academic's showcase</p>
            </div>
            <span className="badge rounded-pill border fw-normal px-3 py-2"
              style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary)', fontSize: '0.85rem' }}>
              3 reviews
            </span>
          </div>

          <div className="d-flex flex-column gap-3 mb-5">
            {featuredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                  
                  {/* Reviewer header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center fw-bold rounded-circle flex-shrink-0"
                        style={{ width: '42px', height: '42px', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}>
                        {feedback.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{feedback.fullName}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          @{feedback.username} · May 2024
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Sections */}
                  <div className="d-flex flex-column gap-2">
                    {Object.entries(feedback).map(([key, value]) => {
                      if (['id', 'fullName', 'username', 'createdAt', 'summary'].includes(key)) return null;
                      return (
                        <div key={key} className="p-3 rounded-3" style={{ backgroundColor: 'var(--background)' }}>
                          <span className="badge rounded-pill fw-semibold mb-2"
                            style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)', fontSize: '0.72rem', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <p className="mb-0 small text-dark">{value as string}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Summarize (Functional Simulator) */}
                  <div className="mt-3 pt-3 border-top">
                    <button 
                      className="btn btn-sm fw-semibold" 
                      onClick={() => handleSummarize(feedback.id, feedback.summary)}
                      disabled={loadingSummaries[feedback.id]}
                      style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px' }}>
                      {loadingSummaries[feedback.id] ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span> Summarizing...</>
                      ) : (
                        <><i className="fas fa-robot me-1"></i> AI Summarize</>
                      )}
                    </button>

                    {activeSummaries[feedback.id] && (
                      <div className="mt-3 p-3 rounded-3 fade-in"
                        style={{ backgroundColor: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="fas fa-magic" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}></i>
                          <span className="small fw-bold" style={{ color: 'var(--primary)' }}>AI Summary</span>
                        </div>
                        <p className="mb-0 small fst-italic" style={{ color: 'var(--text-primary)' }}>
                          "{activeSummaries[feedback.id]}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
