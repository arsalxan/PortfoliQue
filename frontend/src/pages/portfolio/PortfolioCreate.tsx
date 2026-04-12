import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.ts';

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
      setScreenshot(file);
      
      // Create preview
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
      formData.append('url', url);
      formData.append('description', description);
      formData.append('gitRepo', gitRepo);
      if (screenshot) {
        formData.append('screenshotFile', screenshot); // Match backend field name if known, or usually 'screenshotFile' or 'screenshot'
      }

      await portfolioService.createPortfolio(formData);
      navigate('/portfolios');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
            <div className="card-header bg-primary text-white py-3 text-center">
              <h2 className="h4 mb-0 fw-bold">Submit Your Portfolio</h2>
            </div>
            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger shadow-sm mb-4" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="url" className="form-label text-primary fw-bold">Portfolio URL *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-link text-muted"></i>
                    </span>
                    <input
                      type="url"
                      className="form-control border-start-0"
                      id="url"
                      placeholder="https://yourportfolio.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text">Direct link to your live portfolio website.</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label text-primary fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={4}
                    placeholder="Tell us about your portfolio, what tech you used, and what kind of feedback you're looking for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="gitRepo" className="form-label text-primary fw-bold">Git Repository (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fab fa-github text-muted"></i>
                    </span>
                    <input
                      type="url"
                      className="form-control border-start-0"
                      id="gitRepo"
                      placeholder="https://github.com/username/repo"
                      value={gitRepo}
                      onChange={(e) => setGitRepo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="screenshot" className="form-label text-primary fw-bold">Screenshot</label>
                  <input
                    type="file"
                    className="form-control"
                    id="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="form-text">Upload a screenshot of your portfolio (Max 5MB).</div>
                  
                  {screenshotPreview && (
                    <div className="mt-3 position-relative">
                      <img 
                        src={screenshotPreview} 
                        alt="Preview" 
                        className="img-fluid rounded border shadow-sm" 
                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-bold py-3 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i> Submit Portfolio
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-muted mt-2"
                    onClick={() => navigate('/portfolios')}
                  >
                    Cancel
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
