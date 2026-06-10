import { useState, useEffect, useCallback } from 'react';
import { getTestStatus, startTest, submitTest } from '../api/test.api';

export const useTest = (jobId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTestStatus(jobId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch test status');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const start = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await startTest(jobId);
      setAttempt(res.data);
      setAnswers({});
      setResult(null);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to start test';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const submit = useCallback(async (attemptId, testAnswers) => {
    setLoading(true);
    setError(null);
    try {
      const res = await submitTest(attemptId, testAnswers);
      setResult(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit test';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    loading,
    error,
    refetch: fetchStatus,
    attempt,
    answers,
    setAnswers,
    result,
    start,
    submit,
  };
};

export default useTest;
