import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useJobs from '../../../hooks/useJobs';
import useApplications from '../../../hooks/useApplications';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import Card from '../../../components/ui/Card/Card';
import Badge from '../../../components/ui/Badge/Badge';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import EmptyState from '../../../components/ui/EmptyState/EmptyState';
import SkeletonCard from '../../../components/ui/SkeletonCard/SkeletonCard';
import CandidateCard from '../../../components/features/CandidateCard/CandidateCard';
import Spinner from '../../../components/ui/Spinner/Spinner';
import FormGroup from '../../../components/forms/FormGroup/FormGroup';
import { formatDate } from '../../../utils/formatDate';
import './RecruiterJobs.css';

export const RecruiterJobs = () => {
  const navigate = useNavigate();

  // Selected job for candidate viewing
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticSearchInput, setSemanticSearchInput] = useState('');

  // Fetch recruiter jobs
  const { data: jobs, loading: loadingJobs, close: closeJob } = useJobs({
    recruiterOnly: true,
  });

  // Fetch applications for selected job, including semantic searches
  const {
    data: applicants,
    loading: loadingApps,
    error: appsError,
    refetch: refetchApps,
  } = useApplications({
    jobId: selectedJob?.id,
    query: searchQuery,
    recruiter: true,
  });

  const [closingJobId, setClosingJobId] = useState(null);

  // Trigger search refetch
  const handleSemanticSearch = (e) => {
    e.preventDefault();
    setSearchQuery(semanticSearchInput);
  };

  const handleClearSearch = () => {
    setSemanticSearchInput('');
    setSearchQuery('');
  };

  // View applicants for selected job
  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setSemanticSearchInput('');
    setSearchQuery('');
  };

  const handleCloseJobClick = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Close this job? No more applications will be accepted.')) return;

    setClosingJobId(id);
    try {
      await closeJob(id);
      // Update local state if the closed job is currently selected
      if (selectedJob?.id === id) {
        setSelectedJob((prev) => ({ ...prev, status: 'CLOSED' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to close job.');
    } finally {
      setClosingJobId(false);
    }
  };

  const postJobBtn = (
    <Button variant="primary" onClick={() => navigate('/recruiter/post-job')}>
      + Post New Job
    </Button>
  );

  if (loadingJobs && jobs.length === 0) {
    return (
      <PageWrapper title="My Job Postings" subtitle="Manage your jobs and view applicants ranked by AI match score" action={postJobBtn}>
        <SkeletonCard count={3} lines={3} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Job Postings"
      subtitle="Manage your jobs and view applicants ranked by AI match score"
      action={postJobBtn}
      className="hireiq-recruiter-jobs"
    >
      <div
        className={`hireiq-recruiter-jobs__layout ${
          selectedJob ? 'hireiq-recruiter-jobs__layout--split' : ''
        }`}
      >
        {/* Left Side: Jobs posted list */}
        <div className="hireiq-recruiter-jobs__list">
          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs posted yet"
              description="Post your first job listing to find matches."
              icon="📁"
              action={
                <Button variant="primary" onClick={() => navigate('/recruiter/post-job')}>
                  Post First Job
                </Button>
              }
            />
          ) : (
            jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isActive = job.status === 'ACTIVE';

              return (
                <Card
                  key={job.id}
                  onClick={() => handleViewApplicants(job)}
                  className={`hireiq-recruiter-jobs__job-card ${
                    isSelected ? 'hireiq-recruiter-jobs__job-card--selected' : ''
                  }`}
                >
                  <div className="hireiq-recruiter-jobs__job-header">
                    <div>
                      <h3 className="hireiq-recruiter-jobs__job-title">{job.title}</h3>
                      <p className="hireiq-recruiter-jobs__job-meta">
                        {job.location} • {job.experienceRequired} • {job.salaryRange}
                      </p>
                    </div>
                    <Badge variant={isActive ? 'success' : 'gray'}>
                      {job.status}
                    </Badge>
                  </div>

                  <p className="hireiq-recruiter-jobs__job-skills">
                    <strong>Skills:</strong> {job.requiredSkills}
                  </p>

                  <div className="hireiq-recruiter-jobs__job-footer">
                    {isActive && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleCloseJobClick(e, job.id)}
                        loading={closingJobId === job.id}
                      >
                        Close Job
                      </Button>
                    )}
                    <span className="hireiq-recruiter-jobs__job-date">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Side: Applicants Panel */}
        {selectedJob && (
          <div className="hireiq-recruiter-jobs__applicants-panel">
            <div className="hireiq-recruiter-jobs__applicants-header">
              <h3 className="hireiq-recruiter-jobs__applicants-title">
                Applicants — {selectedJob.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedJob(null)}
                className="hireiq-recruiter-jobs__close-panel-btn"
              >
                ✕
              </Button>
            </div>

            {/* Semantic Search Form */}
            <form
              onSubmit={handleSemanticSearch}
              className="hireiq-recruiter-jobs__search-form"
            >
              <input
                type="text"
                placeholder="🔍 Semantic Search (e.g. Java dev with Spring Boot and JWT)"
                value={semanticSearchInput}
                onChange={(e) => setSemanticSearchInput(e.target.value)}
                className="hireiq-form-control hireiq-recruiter-jobs__search-input"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loadingApps}
              >
                Rank Semantically
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                >
                  Clear
                </Button>
              )}
            </form>

            {loadingApps ? (
              <div className="hireiq-recruiter-jobs__apps-loading">
                <Spinner size="lg" />
              </div>
            ) : applicants.length === 0 ? (
              <EmptyState title="No applicants yet" description="Wait for candidates to apply or search in public profile pool." icon="👥" />
            ) : (
              <div className="hireiq-recruiter-jobs__apps-list">
                {applicants.map((app, idx) => (
                  <CandidateCard
                    key={app.id}
                    candidate={app}
                    rank={idx + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default RecruiterJobs;
