import React from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

export const Alert = ({
  children,
  variant = 'info',
  onClose,
  className = '',
  ...props
}) => {
  const baseClass = 'hireiq-alert';
  const variantClass = `${baseClass}--${variant}`;

  const classNames = [
    baseClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (variant) {
      case 'success': return '✓';
      case 'error': return '⚠️';
      case 'warning': return '⚡';
      case 'info':
      default: return '💡';
    }
  };

  return (
    <div className={classNames} role="alert" {...props}>
      <span className="hireiq-alert__icon">{getIcon()}</span>
      <div className="hireiq-alert__content">{children}</div>
      {onClose && (
        <button
          type="button"
          className="hireiq-alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
