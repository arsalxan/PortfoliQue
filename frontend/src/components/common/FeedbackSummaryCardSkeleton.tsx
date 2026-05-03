import Skeleton from './Skeleton';

export default function FeedbackSummaryCardSkeleton() {
  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '12px' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Skeleton width="60px" height="24px" circle={false} className="rounded-pill" />
          <Skeleton width="40px" height="12px" />
        </div>
        
        <Skeleton height="1.2rem" width="90%" className="mb-2" />
        <Skeleton height="1rem" width="70%" className="mb-3" />
        
        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Skeleton circle width="32px" height="32px" />
            <Skeleton width="80px" height="12px" />
          </div>
          <Skeleton width="32px" height="32px" />
        </div>
      </div>
    </div>
  );
}
