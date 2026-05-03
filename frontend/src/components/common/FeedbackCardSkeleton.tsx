import Skeleton from './Skeleton';

export default function FeedbackCardSkeleton() {
  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '12px' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex align-items-center gap-3">
            <Skeleton circle width="42px" height="42px" />
            <div>
              <Skeleton width="120px" height="18px" />
              <Skeleton width="80px" height="12px" className="mt-2" />
            </div>
          </div>
          <Skeleton width="100px" height="32px" />
        </div>
        
        <div className="d-flex flex-column gap-3">
          <div className="p-3 rounded-3 bg-light">
            <Skeleton width="60px" height="15px" className="mb-2" />
            <Skeleton height="12px" />
            <Skeleton height="12px" width="80%" className="mt-2" />
          </div>
          <div className="p-3 rounded-3 bg-light">
            <Skeleton width="80px" height="15px" className="mb-2" />
            <Skeleton height="12px" />
            <Skeleton height="12px" width="70%" className="mt-2" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-top">
          <Skeleton width="120px" height="32px" />
        </div>
      </div>
    </div>
  );
}
