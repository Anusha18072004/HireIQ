import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card/Card';
import './StatCard.css';

export const StatCard = ({
  value,
  label,
  icon,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = '',
  ...props
}) => {
  return (
    <Card className={`hireiq-stat-card ${className}`} {...props}>
      <div className="hireiq-stat-card__container">
        <div className="hireiq-stat-card__details">
          <span className="hireiq-stat-card__label">{label}</span>
          <span className="hireiq-stat-card__value">{value}</span>
          {change && (
            <span
              className={`hireiq-stat-card__change hireiq-stat-card__change--${changeType}`}
            >
              {change}
            </span>
          )}
        </div>
        {icon && <div className="hireiq-stat-card__icon">{icon}</div>}
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  className: PropTypes.string,
};

export default StatCard;
