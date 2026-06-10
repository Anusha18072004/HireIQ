import axiosInstance from './axiosInstance';

export const getMyProfile = () => axiosInstance.get('/profile');
export const getFullProfile = () => axiosInstance.get('/profile');
export const saveProfile = (data) => axiosInstance.post('/profile', data);
export const updateBasicInfo = (data) => axiosInstance.post('/profile', data);

export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return axiosInstance.post('/profile/resume', form);
};

export const getProfileCompletion = () => axiosInstance.get('/profile/completion');

export const addExperience = (data) => axiosInstance.post('/profile/experience', data);
export const updateExperience = (id, data) => axiosInstance.put(`/profile/experience/${id}`, data);
export const deleteExperience = (id) => axiosInstance.delete(`/profile/experience/${id}`);

export const addEducation = (data) => axiosInstance.post('/profile/education', data);
export const updateEducation = (id, data) => axiosInstance.put(`/profile/education/${id}`, data);
export const deleteEducation = (id) => axiosInstance.delete(`/profile/education/${id}`);

export const addProject = (data) => axiosInstance.post('/profile/project', data);
export const updateProject = (id, data) => axiosInstance.put(`/profile/project/${id}`, data);
export const deleteProject = (id) => axiosInstance.delete(`/profile/project/${id}`);

export const addCertification = (data) => axiosInstance.post('/profile/certification', data);
export const updateCertification = (id, data) => axiosInstance.put(`/profile/certification/${id}`, data);
export const deleteCertification = (id) => axiosInstance.delete(`/profile/certification/${id}`);

export const addLanguage = (data) => axiosInstance.post('/profile/language', data);
export const deleteLanguage = (id) => axiosInstance.delete(`/profile/language/${id}`);
