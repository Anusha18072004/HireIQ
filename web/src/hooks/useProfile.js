import { useState, useEffect, useCallback } from 'react';
import { getMyProfile, saveProfile, uploadResume } from '../api/profile.api';

export const useProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyProfile();
      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status !== 404 && status !== 500) {
        setError(err.response?.data?.error || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (profileData) => {
    setError(null);
    try {
      const res = await saveProfile(profileData);
      setData(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save profile';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  const upload = useCallback(async (file) => {
    setError(null);
    try {
      const res = await uploadResume(file);
      setData(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to upload resume';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, save, upload };
};

export default useProfile;
