import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  onClick,
  flat = false,
  variant = 'default', // 'default' | 'blue' | 'orange' | 'purple' | 'primary'
  className = '',
  style = {},
  ...props
}) => {
  const baseClass = flat ? 'hireiq-card-flat' : 'hireiq-card';
  const interactiveClass = onClick ? `${baseClass}--interactive` : '';
  const variantClass = variant !== 'default' ? `${baseClass}--${variant}` : '';

  const classNames = [
    baseClass,
    interactiveClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="hireiq-card__header">
          <div className="hireiq-card__header-text">
            {title && <h3 className="hireiq-card__title">{title}</h3>}
            {subtitle && <p className="hireiq-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="hireiq-card__action">{action}</div>}
        </div>
      )}
      <div className="hireiq-card__content">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  onClick: PropTypes.func,
  flat: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'blue', 'orange', 'purple', 'primary']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Card;
