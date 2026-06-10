import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getScoreColor } from '../../../utils/scoreHelpers';
import './ScoreBar.css';

export const ScoreBar = ({
  score = 0,
  showText = true,
  height = '6px',
  className = '',
  ...props
}) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Small delay to trigger animation on mount
    const t = setTimeout(() => {
      setAnimatedWidth(score);
    }, 100);
    return () => clearTimeout(t);
  }, [score]);

  const barColor = getScoreColor(score);

  return (
    <div className={`hireiq-score-bar ${className}`} {...props}>
      {showText && (
        <div className="hireiq-score-bar__header">
          <span className="hireiq-score-bar__label">Match Score</span>
          <span
            className="hireiq-score-bar__value"
            style={{ color: barColor }}
          >
            {score}%
          </span>
        </div>
      )}
      <div
        className="hireiq-score-bar__track"
        style={{ height }}
      >
        <div
          className="hireiq-score-bar__fill"
          style={{
            width: `${animatedWidth}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
};

ScoreBar.propTypes = {
  score: PropTypes.number,
  showText: PropTypes.bool,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default ScoreBar;
