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
          <div className="col-lg-10 col-xl-8">
            
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-6 fw-bold text-dark mb-2">Showcase Your Work</h1>
              <p className="text-muted lead">Share your portfolio with the community and get expert feedback.</p>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* Left Side: Info (Hidden on mobile) */}
                <div className="col-lg-4 bg-primary text-white p-5 d-none d-lg-flex flex-column justify-content-between">
                  <div>
                    <h4 className="fw-bold mb-4">Why Submit?</h4>
                    <ul className="list-unstyled">
                      <li className="mb-3 d-flex align-items-start">
                        <i className="fas fa-check-circle mt-1 me-3 text-white-50"></i>
                        <span>Get unbiased peer reviews</span>
                      </li>
                      <li className="mb-3 d-flex align-items-start">
                        <i className="fas fa-check-circle mt-1 me-3 text-white-50"></i>
                        <span>AI-powered accessibility audit</span>
                      </li>
                      <li className="mb-3 d-flex align-items-start">
                        <i className="fas fa-check-circle mt-1 me-3 text-white-50"></i>
                        <span>Improve your design quality</span>
                      </li>
                    </ul>
                  </div>
                  <div className="opacity-50 small">
                    <i className="fas fa-shield-alt me-2"></i>Securely hosted on PortfoliQue
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="col-lg-8 p-4 p-md-5 bg-white">
                  {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-primary uppercase">Portfolio Website URL *</label>
                      <div className="input-group input-group-lg border rounded-3 overflow-hidden">
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

                    <div className="mb-4">
                      <label className="form-label fw-bold small text-primary uppercase">Project Description</label>
                      <textarea
                        className="form-control border-2 rounded-3 p-3"
                        rows={3}
                        placeholder="Briefly explain what tech stack you used and your goals..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                      ></textarea>
                    </div>

                    <div className="row g-4 mb-4">
                      <div className="col-md-12">
                        <label className="form-label fw-bold small text-primary uppercase">Git Repository (Optional)</label>
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
                    </div>

                    <div className="mb-5">
                      <label className="form-label fw-bold small text-primary uppercase">Cover Screenshot</label>
                      <div 
                        className="upload-drop-zone border-dashed border-2 rounded-3 p-4 text-center bg-light cursor-pointer"
                        onClick={() => document.getElementById('screenshot')?.click()}
                        style={{ cursor: 'pointer', border: '2px dashed #dee2e6' }}
                      >
                        {screenshotPreview ? (
                          <div className="position-relative">
                            <img src={screenshotPreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '180px' }} />
                            <div className="mt-2 small text-primary fw-bold">Click to change image</div>
                          </div>
                        ) : (
                          <div className="py-2">
                            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
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

                    <div className="d-flex gap-3 justify-content-end align-items-center pt-4 border-top">
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
                          <><i className="fas fa-plus-circle me-2"></i>Publish Portfolio</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
