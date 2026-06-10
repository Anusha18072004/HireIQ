import { useState, useEffect, useCallback } from 'react';
import { getAllJobs, searchJobs, getMyJobs, closeJob as apiCloseJob, createJob as apiCreateJob } from '../api/jobs.api';

export const useJobs = (options = {}) => {
  const { keyword = '', recruiterOnly = false } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (recruiterOnly) {
        res = await getMyJobs();
      } else if (keyword.trim()) {
        res = await searchJobs(keyword);
      } else {
        res = await getAllJobs();
      }
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [keyword, recruiterOnly]);

  const close = useCallback(async (jobId) => {
    setError(null);
    try {
      const res = await apiCloseJob(jobId);
      setData((prev) => prev.map((j) => (j.id === jobId ? res.data : j)));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to close job';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  const create = useCallback(async (jobData) => {
    setError(null);
    try {
      const res = await apiCreateJob(jobData);
      setData((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to post job';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, close, create };
};

export default useJobs;
