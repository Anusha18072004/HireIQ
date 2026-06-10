import React from 'react';
import PropTypes from 'prop-types';
import './TestTimer.css';

export const TestTimer = ({
  seconds = 1800,
  urgentThreshold = 300, // 5 minutes default
  className = '',
  ...props
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isUrgent = seconds < urgentThreshold;

  return (
    <div
      className={`hireiq-test-timer ${
        isUrgent ? 'hireiq-test-timer--urgent' : ''
      } ${className}`}
      {...props}
    >
      <span className="hireiq-test-timer__icon">⏱</span>
      <span className="hireiq-test-timer__value">{formatTime(seconds)}</span>
    </div>
  );
};

TestTimer.propTypes = {
  seconds: PropTypes.number.isRequired,
  urgentThreshold: PropTypes.number,
  className: PropTypes.string,
};

export default TestTimer;
