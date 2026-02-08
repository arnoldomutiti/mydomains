import React from 'react';

function CustomModal({ isOpen, onClose, title, message, type = 'info', onConfirm }) {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header modal-${type}`}>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {isConfirm ? (
            <>
              <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-primary" onClick={() => {
                onConfirm();
                onClose();
              }}>
                Confirm
              </button>
            </>
          ) : (
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomModal;
