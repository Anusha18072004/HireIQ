import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';
import ScoreBar from '../../ui/ScoreBar/ScoreBar';
import './CandidateCard.css';

export const CandidateCard = ({
  candidate,
  rank,
  className = '',
  ...props
}) => {
  const score = candidate.matchScore;

  return (
    <Card className={`hireiq-candidate-card ${className}`} {...props}>
      <div className="hireiq-candidate-card__header">
        <div className="hireiq-candidate-card__profile">
          {rank !== undefined && (
            <span className="hireiq-candidate-card__rank">{rank}</span>
          )}
          <div>
            <strong className="hireiq-candidate-card__name">{candidate.candidateName}</strong>
            <p className="hireiq-candidate-card__email">{candidate.candidateEmail}</p>
          </div>
        </div>

        <div className="hireiq-candidate-card__badge-group">
          {score !== null && (
            <div className="hireiq-candidate-card__score-text">
              {score}% Match
            </div>
          )}
          {candidate.status && (
            <Badge
              variant={
                candidate.status === 'SHORTLISTED' || candidate.status === 'TEST_PASSED' || candidate.status === 'HIRED'
                  ? 'success'
                  : candidate.status === 'REJECTED'
                  ? 'danger'
                  : candidate.status === 'TEST_FAILED'
                  ? 'warning'
                  : 'gray'
              }
            >
              {candidate.status.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {candidate.matchReason && (
        <div className="hireiq-candidate-card__reason">
          <span className="hireiq-candidate-card__reason-icon">💡</span>
          <p className="hireiq-candidate-card__reason-text">{candidate.matchReason}</p>
        </div>
      )}

      {score !== null && (
        <div className="hireiq-candidate-card__score-bar">
          <ScoreBar score={score} showText={false} />
        </div>
      )}
    </Card>
  );
};

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.number.isRequired,
    candidateName: PropTypes.string.isRequired,
    candidateEmail: PropTypes.string.isRequired,
    matchScore: PropTypes.number,
    matchReason: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  rank: PropTypes.number,
  className: PropTypes.string,
};

export default CandidateCard;
