import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';
import ScoreBar from '../../ui/ScoreBar/ScoreBar';
import Button from '../../ui/Button/Button';
import './JobCard.css';

export const JobCard = ({
  job,
  onApply,
  applying = false,
  message = null,
  matchScore = null,
  status = null,
  onTakeTest,
  onImproveScore,
  className = '',
  ...props
}) => {
  const isApplied = !!status;

  return (
    <Card className={`hireiq-job-card ${className}`} {...props}>
      <div className="hireiq-job-card__header">
        <div>
          <h3 className="hireiq-job-card__title">{job.title}</h3>
          <p className="hireiq-job-card__company">🏢 {job.recruiterName}</p>
        </div>
        {status && (
          <Badge
            variant={
              status === 'SHORTLISTED' || status === 'TEST_PASSED' || status === 'HIRED'
                ? 'success'
                : status === 'REJECTED'
                ? 'danger'
                : status === 'TEST_FAILED'
                ? 'warning'
                : 'gray'
            }
          >
            {status.replace('_', ' ')}
          </Badge>
        )}
      </div>

      <div className="hireiq-job-card__meta">
        {job.location && <Badge variant="gray">📍 {job.location}</Badge>}
        {job.experienceRequired && <Badge variant="primary">⏱ {job.experienceRequired}</Badge>}
        {job.salaryRange && <Badge variant="success">💰 {job.salaryRange}</Badge>}
      </div>

      <p className="hireiq-job-card__description">
        {job.description && job.description.length > 120
          ? `${job.description.slice(0, 120)}...`
          : job.description}
      </p>

      <div className="hireiq-job-card__skills">
        <strong>Required Skills:</strong> {job.requiredSkills}
      </div>

      {matchScore !== null && (
        <div className="hireiq-job-card__score">
          <ScoreBar score={matchScore} />
        </div>
      )}

      {message && message.jobId === job.id && (
        <div
          className={`hireiq-job-card__alert hireiq-job-card__alert--${
            message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'error'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="hireiq-job-card__actions">
        {isApplied ? (
          status !== 'SHORTLISTED' && (
            <Button
              variant="outline"
              disabled
              fullWidth
            >
              Applied
            </Button>
          )
        ) : (
          onApply && (
            <Button
              variant="primary"
              onClick={() => onApply(job.id)}
              loading={applying}
              fullWidth
            >
              Apply Now
            </Button>
          )
        )}

        {status === 'SHORTLISTED' && onTakeTest && (
          <Button
            variant="success"
            onClick={() => onTakeTest(job.id)}
            fullWidth
          >
            🧠 Take AI Test
          </Button>
        )}

        {matchScore !== null && matchScore < 75 && onImproveScore && (
          <Button
            variant="accent"
            onClick={onImproveScore}
            fullWidth
            className="hireiq-job-card__btn--improve"
          >
            📈 Improve Score
          </Button>
        )}
      </div>
    </Card>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    recruiterName: PropTypes.string,
    location: PropTypes.string,
    experienceRequired: PropTypes.string,
    salaryRange: PropTypes.string,
    description: PropTypes.string,
    requiredSkills: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func,
  applying: PropTypes.bool,
  message: PropTypes.shape({
    jobId: PropTypes.number,
    type: PropTypes.string,
    text: PropTypes.string,
  }),
  matchScore: PropTypes.number,
  status: PropTypes.string,
  onTakeTest: PropTypes.func,
  onImproveScore: PropTypes.func,
  className: PropTypes.string,
};

export default JobCard;
