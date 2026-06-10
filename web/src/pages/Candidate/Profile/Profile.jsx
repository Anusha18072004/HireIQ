import React, { useState, useEffect } from 'react';
import useProfile from '../../../hooks/useProfile';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import Alert from '../../../components/ui/Alert/Alert';
import Spinner from '../../../components/ui/Spinner/Spinner';
import { getProfileCompletion } from '../../../api/profile.api';

// Sub-components
import ProfileHeader from './components/ProfileHeader';
import BasicInfoCard from './components/BasicInfoCard';
import CareerPrefsCard from './components/CareerPrefsCard';
import ExperienceCard from './components/ExperienceCard';
import EducationCard from './components/EducationCard';
import SkillsCard from './components/SkillsCard';
import ProjectsCard from './components/ProjectsCard';
import CertificationsCard from './components/CertificationsCard';
import LanguagesCard from './components/LanguagesCard';
import ResumeCard from './components/ResumeCard';

import './Profile.css';

export const Profile = () => {
  const {
    data: profile,
    loading: loadingProfile,
    error: profileError,
    save,
    upload,
    refetch,
  } = useProfile();

  const [completion, setCompletion] = useState({ score: 0, missingItems: [] });
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchCompletion = async () => {
    setLoadingCompletion(true);
    try {
      const res = await getProfileCompletion();
      setCompletion(res.data);
    } catch (err) {
      console.error('Failed to fetch completion details:', err);
    } finally {
      setLoadingCompletion(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleRefresh = async () => {
    await refetch();
    await fetchCompletion();
  };

  // ── Save handlers ───────────────────────────────────────────

  const handleSaveBasicInfo = async (basicInfo) => {
    setMessage(null);
    try {
      await save({ ...profile, ...basicInfo });
      setMessage({ type: 'success', text: 'Basic details updated successfully!' });
      await handleRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update basic details.' });
      throw err;
    }
  };

  const handleSaveHeaderInfo = async (headerInfo) => {
    setMessage(null);
    try {
      await save({ ...profile, ...headerInfo });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchCompletion();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
      throw err;
    }
  };

  const handleSaveCareerPrefs = async (prefs) => {
    setMessage(null);
    try {
      await save({ ...profile, ...prefs });
      setMessage({ type: 'success', text: 'Career preferences updated successfully!' });
      await handleRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update career preferences.' });
      throw err;
    }
  };

  const handleSaveSkills = async (skillsString) => {
    setMessage(null);
    try {
      await save({ ...profile, skills: skillsString });
      setMessage({ type: 'success', text: 'Skills updated successfully!' });
      await handleRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update skills.' });
      throw err;
    }
  };

  const handleResumeUpload = async (file) => {
    setUploading(true);
    setMessage(null);
    try {
      const resData = await upload(file);

      // Full refetch after upload so all nested arrays are properly populated
      await refetch();
      await fetchCompletion();

      if (resData && resData.aiExtractedSections && resData.aiExtractedSections.length > 0) {
        setMessage({
          type: 'success',
          text: (
            <div>
              <strong>✅ Resume uploaded and AI extracted:</strong>
              <ul
                style={{
                  margin: '0.4rem 0',
                  paddingLeft: '1.2rem',
                  textAlign: 'left',
                  listStyleType: 'disc',
                }}
              >
                {resData.aiExtractedSections.map((sec, idx) => (
                  <li key={idx} style={{ margin: '0.2rem 0' }}>
                    {sec}
                  </li>
                ))}
              </ul>
              <div>
                Review and edit the AI-extracted entries below. They are highlighted with the
                "AI Extracted" badge.
              </div>
            </div>
          ),
        });
      } else {
        setMessage({ type: 'success', text: 'Resume uploaded and processed successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload and parse resume.' });
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────

  if (loadingProfile && !profile) {
    return (
      <div className="loading-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <PageWrapper
      title="My Profile"
      subtitle="Keep your profile complete to improve match scores and attract recruiters"
      maxWidth="1200px"
      className="hireiq-profile-page"
    >
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </Alert>
      )}

      {profileError && <Alert variant="error">{profileError}</Alert>}

      <ProfileHeader
        profile={profile}
        completion={completion}
        onSave={handleSaveHeaderInfo}
      />

      <div className="hireiq-profile-page__layout">
        {/* Left column: core profile details */}
        <div className="hireiq-profile-page__main-col">
          <div id="basic-info-section">
            <BasicInfoCard profile={profile} onSave={handleSaveBasicInfo} />
          </div>

          <CareerPrefsCard profile={profile} onSave={handleSaveCareerPrefs} />

          <ExperienceCard
            experiences={profile?.experiences || []}
            onRefresh={handleRefresh}
          />

          <EducationCard
            educations={profile?.educations || []}
            onRefresh={handleRefresh}
          />

          <ProjectsCard
            projects={profile?.projects || []}
            onRefresh={handleRefresh}
          />

          <CertificationsCard
            certifications={profile?.certifications || []}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Right column: resume, skills, languages */}
        <div className="hireiq-profile-page__sidebar-col">
          <ResumeCard
            profile={profile}
            onUpload={handleResumeUpload}
            uploading={uploading}
          />

          <SkillsCard
            skills={profile?.skills || ''}
            onSave={handleSaveSkills}
          />

          <LanguagesCard
            languages={profile?.languages || []}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
