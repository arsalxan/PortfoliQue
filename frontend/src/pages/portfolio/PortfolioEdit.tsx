import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import toast from 'react-hot-toast';
import Skeleton from '../../components/common/Skeleton.tsx';

export default function PortfolioEdit() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [newScreenshot, setNewScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPortfolio(parseInt(id));
    }
  }, [id]);

  const fetchPortfolio = async (portfolioId: number) => {
    setLoading(true);
    try {
      const data = await portfolioService.getPortfolioById(portfolioId);

      // Ownership guard: redirect anyone who isn't the portfolio owner
      if (data.userId !== user?.id) {
        toast.error('You are not authorized to edit this portfolio.');
        navigate('/portfolios', { replace: true });
        return;
      }

      setUrl(data.url);
      setDescription(data.description || '');
      setGitRepo(data.gitRepo || '');
      setCurrentScreenshot(data.screenshot);
    } catch (err) {
      setError('Failed to load portfolio details.');
    } finally {
      setLoading(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewScreenshot(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !url.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Bundle data into a JSON blob (matches backend @RequestPart("portfolio"))
      const portfolioData = { url, description, gitRepo };
      formData.append('portfolio', new Blob([JSON.stringify(portfolioData)], { type: 'application/json' }));
      
      if (newScreenshot) {
        // Backend expects "screenshot" field name
        formData.append('screenshot', newScreenshot);
      }

      await portfolioService.updatePortfolio(parseInt(id), formData);
      navigate('/portfolios');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 bg-light-subtle min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="text-center mb-4">
                <Skeleton width="200px" height="32px" className="mx-auto mb-2" />
                <Skeleton width="300px" height="14px" className="mx-auto" />
              </div>
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white p-5">
                <div className="row g-4">
                  <div className="col-lg-6">
                    <Skeleton height="80px" className="mb-4" />
                    <Skeleton height="200px" />
                  </div>
                  <div className="col-lg-6">
                    <Skeleton height="80px" className="mb-4" />
                    <Skeleton height="200px" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light-subtle min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            
            {/* Compact Header */}
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark mb-1">Edit Your Portfolio</h1>
              <p className="text-muted small">Update your project details and showcase your progress.</p>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white p-4 p-md-5">
              {error && (
                <div className="alert alert-danger shadow-sm mb-4" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i> {error}
                </div>
              )}

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
                        ) : currentScreenshot ? (
                          <div className="position-relative w-100">
                            <img src={currentScreenshot} alt="Current" className="img-fluid rounded shadow-sm" style={{ maxHeight: '140px' }} />
                            <div className="mt-2 small text-muted">Click to update screenshot</div>
                          </div>
                        ) : (
                          <div className="py-2">
                            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                            <p className="mb-0 text-muted small">Click to upload new</p>
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
                    className="btn btn-warning px-5 rounded-pill fw-bold shadow-sm text-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>
                    ) : (
                      <><i className="fas fa-save me-2"></i>Update Portfolio</>
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
