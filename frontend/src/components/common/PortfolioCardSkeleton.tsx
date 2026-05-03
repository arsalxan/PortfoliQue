import Skeleton from './Skeleton';

export default function PortfolioCardSkeleton() {
  return (
    <div className="card h-100 border-0 shadow-sm overflow-hidden">
      <Skeleton height="200px" className="card-img-top" />
      <div className="card-body">
        <Skeleton className="skeleton-title mb-2" />
        <Skeleton className="skeleton-text" />
        <Skeleton className="skeleton-text" width="80%" />
        <div className="d-flex align-items-center mt-3">
          <Skeleton circle width="32px" height="32px" className="me-2" />
          <Skeleton width="100px" height="12px" />
        </div>
      </div>
    </div>
  );
}
