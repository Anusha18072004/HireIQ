import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="hireiq-modal-overlay" onClick={onClose} {...props}>
      <div
        className={`hireiq-modal hireiq-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hireiq-modal__header">
          {title && <h3 className="hireiq-modal__title">{title}</h3>}
          {onClose && (
            <button
              type="button"
              className="hireiq-modal__close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>
        <div className="hireiq-modal__body">{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Modal;
