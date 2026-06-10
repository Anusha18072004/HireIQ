import React from 'react';
import PropTypes from 'prop-types';
import './EmptyState.css';

export const EmptyState = ({
  title,
  description,
  icon = '🔍',
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`hireiq-empty-state ${className}`} {...props}>
      {icon && <div className="hireiq-empty-state__icon">{icon}</div>}
      {title && <h3 className="hireiq-empty-state__title">{title}</h3>}
      {description && <p className="hireiq-empty-state__description">{description}</p>}
      {action && <div className="hireiq-empty-state__action">{action}</div>}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;
