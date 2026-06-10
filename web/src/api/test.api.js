import axiosInstance from './axiosInstance';

export const getTestStatus = (jobId) => axiosInstance.get(`/test/status/${jobId}`);
export const startTest = (jobId) => axiosInstance.post(`/test/start/${jobId}`);
export const submitTest = (id, answers) => axiosInstance.post(`/test/submit/${id}`, { answers });
