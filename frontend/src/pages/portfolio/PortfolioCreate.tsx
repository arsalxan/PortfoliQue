import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import toast from 'react-hot-toast';

export default function PortfolioCreate() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Portfolio URL is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      const portfolioData = { url, description, gitRepo };
      formData.append('portfolio', new Blob([JSON.stringify(portfolioData)], { type: 'application/json' }));
      
      if (screenshot) {
        formData.append('screenshot', screenshot); 
      }

      await portfolioService.createPortfolio(formData);
      toast.success('Portfolio published successfully!');
      navigate('/portfolios');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create portfolio. Please try again.');
      toast.error('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-5 bg-light-subtle min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            
            {/* Compact Header */}
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark mb-1">Showcase Your Work</h1>
              <p className="text-muted small">Share your project with the community for structured feedback.</p>
            </div>

            {/* Compact Benefits Bar */}
            <div className="row g-3 mb-4 text-center justify-content-center d-none d-md-flex">
              <div className="col-md-3">
                <div className="small text-muted fw-bold text-uppercase">
                  <i className="fas fa-check-circle text-primary me-2"></i> Peer Reviews
                </div>
              </div>
              <div className="col-md-3">
                <div className="small text-muted fw-bold text-uppercase">
                  <i className="fas fa-check-circle text-primary me-2"></i> AI Audit
                </div>
              </div>
              <div className="col-md-3">
                <div className="small text-muted fw-bold text-uppercase">
                  <i className="fas fa-check-circle text-primary me-2"></i> Design Quality
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white p-4 p-md-5">
              {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Left Column: Core Details */}
                  <div className="col-lg-6 border-end-lg">
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-primary text-uppercase">Portfolio Website URL *</label>
                      <div className="input-group border rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0">
                          <i className="fas fa-globe text-muted"></i>
                        </span>
                        <input
                          type="url"
                          className="form-control border-0 shadow-none fs-6"
                          placeholder="https://yourname.github.io"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-0">
                      <label className="form-label fw-bold small text-primary text-uppercase">Project Description</label>
                      <textarea
                        className="form-control border-1 rounded-3 p-3"
                        rows={6}
                        placeholder="Explain your tech stack, goals, and specific areas where you need feedback..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column: Assets & Links */}
                  <div className="col-lg-6">
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-primary text-uppercase">Git Repository (Optional)</label>
                      <div className="input-group border rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0">
                          <i className="fab fa-github text-muted"></i>
                        </span>
                        <input
                          type="url"
                          className="form-control border-0 shadow-none fs-6"
                          placeholder="https://github.com/user/project"
                          value={gitRepo}
                          onChange={(e) => setGitRepo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-0">
                      <label className="form-label fw-bold small text-primary text-uppercase">Cover Screenshot</label>
                      <div 
                        className="upload-drop-zone border-dashed border-2 rounded-3 p-4 text-center bg-light cursor-pointer h-100 d-flex flex-column justify-content-center align-items-center"
                        onClick={() => document.getElementById('screenshot')?.click()}
                        style={{ cursor: 'pointer', border: '2px dashed #dee2e6', minHeight: '160px' }}
                      >
                        {screenshotPreview ? (
                          <div className="position-relative w-100">
                            <img src={screenshotPreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '140px' }} />
                            <div className="mt-2 small text-primary fw-bold">Click to change</div>
                          </div>
                        ) : (
                          <div className="py-2">
                            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                            <p className="mb-0 text-muted small">Drag & drop or click to upload</p>
                            <span className="text-secondary" style={{ fontSize: '10px' }}>JPG, PNG, WebP (Max 5MB)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          id="screenshot"
                          className="d-none"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="d-flex gap-3 justify-content-end align-items-center mt-5 pt-4 border-top">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill fw-semibold"
                    onClick={() => navigate('/portfolios')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Publishing...</>
                    ) : (
                      <><i className="fas fa-rocket me-2"></i>Publish Portfolio</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
