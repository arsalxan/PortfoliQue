export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  const content = (
    <div className="d-flex flex-column justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-bold">Connecting to PortfoliQue...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        {content}
      </div>
    );
  }

  return content;
}
