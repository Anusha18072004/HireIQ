import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useJobs from '../../../hooks/useJobs';
import useApplications from '../../../hooks/useApplications';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import JobCard from '../../../components/features/JobCard/JobCard';
import SkeletonCard from '../../../components/ui/SkeletonCard/SkeletonCard';
import EmptyState from '../../../components/ui/EmptyState/EmptyState';
import Button from '../../../components/ui/Button/Button';
import './Jobs.css';

export const Jobs = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: jobs, loading: loadingJobs, refetch: refetchJobs } = useJobs({
    keyword: searchQuery,
  });
  const { data: applications, apply, loading: applyingJob, error: applyError } = useApplications();
  const [applyMessage, setApplyMessage] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setSearchQuery('');
  };

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    setApplyMessage(null);
    try {
      const res = await apply(jobId);
      const { matchScore, status } = res;
      if (status === 'SHORTLISTED') {
        setApplyMessage({
          jobId,
          type: 'success',
          text: `Match score: ${matchScore}% — You are SHORTLISTED! You can now take the AI test.`,
        });
      } else {
        setApplyMessage({
          jobId,
          type: 'warning',
          text: `Match score: ${matchScore}% — Below 75% required. Profile does not meet the minimum requirement for this role.`,
        });
      }
    } catch (err) {
      setApplyMessage({
        jobId,
        type: 'error',
        text: err.message || 'Application failed.',
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <PageWrapper
      title="Browse Jobs"
      subtitle="Find your perfect role — AI matches your resume automatically"
      className="hireiq-jobs-page"
    >
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="hireiq-jobs-page__search-form">
        <input
          type="text"
          placeholder="Search by job title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="hireiq-form-control hireiq-jobs-page__search-input"
        />
        <Button type="submit" variant="primary">Search</Button>
        {searchQuery && (
          <Button type="button" variant="outline" onClick={handleClearSearch}>
            Clear
          </Button>
        )}
      </form>

      {loadingJobs ? (
        <div className="hireiq-jobs-page__loading-grid">
          <SkeletonCard count={4} lines={4} />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            searchQuery
              ? "Try a different search keyword or check back later."
              : "There are currently no active job openings."
          }
          icon="💼"
          action={
            searchQuery ? (
              <Button variant="outline" onClick={handleClearSearch}>
                Reset Search
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="hireiq-jobs-page__grid">
          {jobs.map((job) => {
            const app = applications ? applications.find((a) => a.jobId === job.id) : null;
            const status = app ? app.status : null;
            const matchScore = app ? app.matchScore : null;

            return (
              <JobCard
                key={job.id}
                job={job}
                status={status}
                matchScore={matchScore}
                onApply={handleApply}
                applying={applyingJobId === job.id}
                message={applyMessage}
                onTakeTest={(id) => navigate(`/test/${id}`)}
                onImproveScore={() => navigate('/profile')}
              />
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

export default Jobs;
