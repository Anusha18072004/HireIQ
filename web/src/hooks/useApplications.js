import { useState, useEffect, useCallback } from 'react';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  searchJobApplicationsSemantically,
} from '../api/applications.api';

export const useApplications = (options = {}) => {
  const { jobId = null, query = '', recruiter = false } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    const shouldFetch = !recruiter || (recruiter && jobId);
    if (!shouldFetch) return;

    setLoading(true);
    setError(null);
    try {
      let res;
      if (recruiter) {
        if (query.trim()) {
          res = await searchJobApplicationsSemantically(jobId, query);
        } else {
          res = await getJobApplications(jobId);
        }
      } else {
        res = await getMyApplications();
      }
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, query, recruiter]);

  const apply = useCallback(async (jobToApplyId) => {
    setError(null);
    try {
      const res = await applyForJob(jobToApplyId);
      if (!recruiter) {
        refetch();
      }
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to apply for job';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, [recruiter, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, apply };
};

export default useApplications;
