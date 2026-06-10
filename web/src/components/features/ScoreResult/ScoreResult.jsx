import React from 'react';
import PropTypes from 'prop-types';
import { getScoreColor, getScoreLabel } from '../../../utils/scoreHelpers';
import './ScoreResult.css';

export const ScoreResult = ({
  score = 0,
  reason = '',
  className = '',
  ...props
}) => {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className={`hireiq-score-result ${className}`} {...props}>
      <div
        className="hireiq-score-result__badge"
        style={{
          background: `${scoreColor}1A`, // opacity overlay
          borderColor: scoreColor,
        }}
      >
        <span
          className="hireiq-score-result__value"
          style={{ color: scoreColor }}
        >
          {score}%
        </span>
        <span
          className="hireiq-score-result__label"
          style={{ color: scoreColor }}
        >
          {scoreLabel}
        </span>
      </div>

      {reason && (
        <div className="hireiq-score-result__reason">
          <span className="hireiq-score-result__reason-icon">💡</span>
          <p className="hireiq-score-result__reason-text">{reason}</p>
        </div>
      )}
    </div>
  );
};

ScoreResult.propTypes = {
  score: PropTypes.number.isRequired,
  reason: PropTypes.string,
  className: PropTypes.string,
};

export default ScoreResult;
