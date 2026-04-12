import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  body: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  show,
  title,
  body,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRef.current) return;

    // Access Bootstrap's Modal API from the global window
    const bsModal = (window as any).bootstrap?.Modal;
    if (!bsModal) return;

    const modalInstance = bsModal.getOrCreateInstance(modalRef.current);

    if (show) {
      modalInstance.show();
    } else {
      modalInstance.hide();
    }

    return () => {
      modalInstance.hide();
    };
  }, [show]);

  // Handle Bootstrap's hidden event to sync state
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const handleHidden = () => {
      if (show) onCancel();
    };

    el.addEventListener('hidden.bs.modal', handleHidden);
    return () => el.removeEventListener('hidden.bs.modal', handleHidden);
  }, [show, onCancel]);

  return (
    <div className="modal fade" ref={modalRef} tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
          </div>
          <div className="modal-body text-black">{body}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
