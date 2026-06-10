import axiosInstance from './axiosInstance';

export const applyForJob = (jobId) => axiosInstance.post(`/applications/apply/${jobId}`);
export const getMyApplications = () => axiosInstance.get('/applications/my');
export const getJobApplications = (jobId) => axiosInstance.get(`/applications/job/${jobId}`);
export const searchJobApplicationsSemantically = (jobId, query) =>
  axiosInstance.get(`/applications/job/${jobId}/search?query=${encodeURIComponent(query)}`);
