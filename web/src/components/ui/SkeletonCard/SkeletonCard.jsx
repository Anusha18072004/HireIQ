import React from 'react';
import PropTypes from 'prop-types';
import './SkeletonCard.css';

export const SkeletonCard = ({
  count = 1,
  lines = 3,
  className = '',
  ...props
}) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`hireiq-skeleton-card ${className}`}
          {...props}
        >
          <div className="hireiq-skeleton-card__title hireiq-skeleton-shimmer" />
          <div className="hireiq-skeleton-card__subtitle hireiq-skeleton-shimmer" />
          <div className="hireiq-skeleton-card__body">
            {Array.from({ length: lines }).map((_, lineIdx) => (
              <div
                key={lineIdx}
                className="hireiq-skeleton-card__line hireiq-skeleton-shimmer"
                style={{ width: `${80 - lineIdx * 10}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

SkeletonCard.propTypes = {
  count: PropTypes.number,
  lines: PropTypes.number,
  className: PropTypes.string,
};

export default SkeletonCard;
