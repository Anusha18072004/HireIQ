import React from 'react';
import './CompletionBar.css';

export const CompletionBar = ({ score = 0, missingItems = [] }) => {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="hireiq-completion">
      <div className="hireiq-completion__circle-wrap">
        <svg className="hireiq-completion__svg" width="96" height="96">
          <circle
            className="hireiq-completion__circle-bg"
            cx="48"
            cy="48"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="hireiq-completion__circle-fill"
            cx="48"
            cy="48"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 48 48)"
          />
        </svg>
        <span className="hireiq-completion__percentage">{score}%</span>
      </div>
      <div className="hireiq-completion__content">
        <h4 className="hireiq-completion__title">Profile Strength</h4>
        {missingItems && missingItems.length > 0 ? (
          <p className="hireiq-completion__help-text">
            Add <strong className="hireiq-completion__highlight">{missingItems[0]}</strong> to boost your score!
          </p>
        ) : (
          <p className="hireiq-completion__help-text hireiq-completion__help-text--success">
            All details completed! Your profile is excellent.
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletionBar;
