import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'gray',
  className = '',
  ...props
}) => {
  const baseClass = 'hireiq-badge';
  const variantClass = `${baseClass}--${variant}`;

  const classNames = [
    baseClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'gray', 'accent', 'primary']),
  className: PropTypes.string,
};

export default Badge;
