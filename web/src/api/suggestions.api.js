import { getMyProfile } from './profile.api';
import { getMyApplications } from './applications.api';
import { getTestStatus } from './test.api';

export const getResumeSuggestions = async () => {
  const res = await getMyProfile();
  return {
    resumeFeedback: res.data.resumeFeedback,
    skillGaps: res.data.skillGaps,
    careerPaths: res.data.careerPaths,
  };
};

export const getMatchSuggestions = async (jobId) => {
  const res = await getMyApplications();
  const app = res.data.find((a) => a.jobId === Number(jobId) || a.jobId === jobId);
  if (!app) return null;
  return {
    tailoringSuggestions: app.tailoringSuggestions,
    interviewTips: app.interviewTips,
    upskillingRoadmap: app.upskillingRoadmap,
    matchScore: app.matchScore,
    matchReason: app.matchReason,
  };
};

export const getTestSuggestions = async (jobId) => {
  const res = await getTestStatus(jobId);
  return {
    weakTopics: res.data.weakTopics,
    strengths: res.data.strengths,
    improvementSuggestions: res.data.improvementSuggestions,
    lastScore: res.data.lastScore,
  };
};
