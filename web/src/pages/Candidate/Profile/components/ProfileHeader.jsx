import React, { useState, useEffect } from 'react';
import CompletionBar from './CompletionBar';
import Button from '../../../../components/ui/Button/Button';
import './ProfileHeader.css';

export const ProfileHeader = ({ profile, completion, onSave }) => {
  const {
    fullName,
    firstName,
    lastName,
    currentRole,
    city,
    state,
    totalExperienceYears = 0,
    totalExperienceMonths = 0,
    skills,
    projects = [],
    certifications = [],
    summary,
    linkedinUrl,
    githubUrl,
  } = profile || {};

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    currentRole: '',
    totalExperienceYears: 0,
    totalExperienceMonths: 0,
    summary: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  // Sync form whenever individual profile fields change (e.g. after AI extraction)
  useEffect(() => {
    setForm({
      currentRole: currentRole || '',
      totalExperienceYears: totalExperienceYears || 0,
      totalExperienceMonths: totalExperienceMonths || 0,
      summary: summary || '',
      linkedinUrl: linkedinUrl || '',
      githubUrl: githubUrl || '',
    });
  }, [currentRole, totalExperienceYears, totalExperienceMonths, summary, linkedinUrl, githubUrl]);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (fullName) {
      const parts = fullName.split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return fullName.slice(0, 2).toUpperCase();
    }
    return 'IQ';
  };

  const getExperienceString = () => {
    const years = totalExperienceYears || 0;
    const months = totalExperienceMonths || 0;
    if (years === 0 && months === 0) return 'Fresher';
    let res = '';
    if (years > 0) res += `${years} yr${years > 1 ? 's' : ''} `;
    if (months > 0) res += `${months} mo${months > 1 ? 's' : ''}`;
    return res.trim();
  };

  const skillCount = skills
    ? skills.split(',').filter((s) => s.trim().length > 0).length
    : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (onSave) {
      await onSave({
        ...profile,
        currentRole: form.currentRole,
        totalExperienceYears: Number(form.totalExperienceYears),
        totalExperienceMonths: Number(form.totalExperienceMonths),
        summary: form.summary,
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
      });
    }
    setIsEditing(false);
  };

  const field = (label, key, type = 'text', opts = null) => (
    <div className="hireiq-profile-header__edit-field">
      <label className="hireiq-profile-header__edit-label">{label}</label>
      {opts ? (
        <select
          className="hireiq-form-control"
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        >
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="hireiq-form-control"
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <div className="hireiq-profile-header">
      <div className="hireiq-profile-header__main">
        <div className="hireiq-profile-header__avatar">{getInitials()}</div>

        <div className="hireiq-profile-header__details">
          <div className="hireiq-profile-header__name-row">
            <h1 className="hireiq-profile-header__name">
              {firstName && lastName
                ? `${firstName} ${lastName}`
                : fullName || 'Candidate Name'}
            </h1>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="hireiq-profile-header__edit-btn"
              >
                ✏️ Edit
              </Button>
            )}
          </div>

          {!isEditing ? (
            <>
              {currentRole ? (
                <p className="hireiq-profile-header__role">💼 {currentRole}</p>
              ) : (
                <p className="hireiq-profile-header__role hireiq-profile-header__role--empty">
                  No current role — click Edit to add
                </p>
              )}

              <div className="hireiq-profile-header__meta">
                {(city || state) && (
                  <span className="hireiq-profile-header__meta-item">
                    📍 {city}
                    {city && state ? ', ' : ''}
                    {state}
                  </span>
                )}
                <span className="hireiq-profile-header__meta-item">
                  ⏱ {getExperienceString()}
                </span>
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hireiq-profile-header__meta-item hireiq-profile-header__link"
                  >
                    🔗 LinkedIn
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hireiq-profile-header__meta-item hireiq-profile-header__link"
                  >
                    🐙 GitHub
                  </a>
                )}
              </div>

              {summary && (
                <p className="hireiq-profile-header__summary">{summary}</p>
              )}

              <div className="hireiq-profile-header__stats">
                <div className="hireiq-profile-header__stat-box">
                  <span className="hireiq-profile-header__stat-num">{skillCount}</span>
                  <span className="hireiq-profile-header__stat-label">Skills</span>
                </div>
                <div className="hireiq-profile-header__stat-box">
                  <span className="hireiq-profile-header__stat-num">
                    {(projects || []).length}
                  </span>
                  <span className="hireiq-profile-header__stat-label">Projects</span>
                </div>
                <div className="hireiq-profile-header__stat-box">
                  <span className="hireiq-profile-header__stat-num">
                    {(certifications || []).length}
                  </span>
                  <span className="hireiq-profile-header__stat-label">Certifications</span>
                </div>
              </div>
            </>
          ) : (
            /* ── Inline edit form ──────────────────────────── */
            <form onSubmit={handleSave} className="hireiq-profile-header__edit-form">
              <div className="hireiq-profile-header__edit-grid">
                {field('Current Role / Job Title', 'currentRole')}
                {field('Years of Experience', 'totalExperienceYears', 'number')}
                {field('Months of Experience', 'totalExperienceMonths', 'number')}
                {field('LinkedIn URL', 'linkedinUrl', 'url')}
                {field('GitHub URL', 'githubUrl', 'url')}
              </div>

              <div className="hireiq-profile-header__edit-field hireiq-profile-header__edit-field--full">
                <label className="hireiq-profile-header__edit-label">
                  Professional Summary
                </label>
                <textarea
                  className="hireiq-form-control"
                  rows={4}
                  value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="A brief summary of your experience and goals..."
                />
              </div>

              <div className="hireiq-profile-header__edit-actions">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="hireiq-profile-header__completion-wrap">
        <CompletionBar
          score={completion?.score || 0}
          missingItems={completion?.missingItems || []}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
