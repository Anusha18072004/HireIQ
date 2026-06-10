import axiosInstance from './axiosInstance';

export const getAllJobs = () => axiosInstance.get('/jobs');
export const getJobById = (id) => axiosInstance.get(`/jobs/${id}`);
export const createJob = (data) => axiosInstance.post('/jobs', data);
export const getMyJobs = () => axiosInstance.get('/jobs/my-jobs');
export const closeJob = (id) => axiosInstance.patch(`/jobs/${id}/close`);
export const searchJobs = (keyword) => axiosInstance.get(`/jobs/search?keyword=${keyword}`);
