import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import ExperienceModal from './ExperienceModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { addExperience, updateExperience, deleteExperience } from '../../../../api/profile.api';

export const ExperienceCard = ({ experiences = [], onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const handleOpenAdd = () => {
    setSelectedExperience(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setSelectedExperience(exp);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (selectedExperience) {
      await updateExperience(selectedExperience.id, data);
    } else {
      await addExperience(data);
    }
    onRefresh();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteExperience(deleteId);
      setDeleteId(null);
      onRefresh();
    }
  };

  const calculateDuration = (startMonth, startYear, endMonth, endYear, isCurrentJob) => {
    if (!startMonth || !startYear) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const startIdx = months.indexOf(startMonth);
    const startDate = new Date(startYear, startIdx);

    let endDate;
    if (isCurrentJob) {
      endDate = new Date();
    } else {
      if (!endMonth || !endYear) return '';
      const endIdx = months.indexOf(endMonth);
      endDate = new Date(endYear, endIdx);
    }

    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    const yrs = Math.floor(diffMonths / 12);
    const mos = diffMonths % 12;

    let durationStr = '';
    if (yrs > 0) {
      durationStr += `${yrs} yr${yrs > 1 ? 's' : ''} `;
    }
    if (mos > 0) {
      durationStr += `${mos} month${mos > 1 ? 's' : ''}`;
    }

    const endStr = isCurrentJob ? 'Present' : `${endMonth} ${endYear}`;
    return `${startMonth} ${startYear} – ${endStr} (${durationStr.trim() || '1 month'})`;
  };

  const DescriptionText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;
    if (text.length <= 150) return <p className="hireiq-experience-card__desc">{text}</p>;

    return (
      <p className="hireiq-experience-card__desc">
        {expanded ? text : `${text.slice(0, 150)}...`}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="hireiq-experience-card__more-btn"
        >
          {expanded ? ' Read less' : ' Read more'}
        </button>
      </p>
    );
  };

  return (
    <Card
      title="💼 Work Experience"
      action={
        <Button variant="accent" size="sm" onClick={handleOpenAdd}>
          + Add Experience
        </Button>
      }
      className="hireiq-profile-page__section-card"
    >
      {experiences.length === 0 ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">💼</span>
          <p className="hireiq-profile-page__empty-text">No experience added yet.</p>
        </div>
      ) : (
        <div className="hireiq-experience-list">
          {experiences.map((exp) => {
            const logoLetter = exp.companyName ? exp.companyName.charAt(0).toUpperCase() : 'C';
            return (
              <div key={exp.id} className="hireiq-experience-card">
                <div className="hireiq-experience-card__avatar">
                  {logoLetter}
                </div>
                <div className="hireiq-experience-card__content">
                  <div className="hireiq-experience-card__title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 className="hireiq-experience-card__title">{exp.jobTitle}</h4>
                      {exp.isAiExtracted && <span className="ai-badge">AI Extracted</span>}
                    </div>
                    <div className="hireiq-experience-card__actions" style={{ display: 'flex', gap: '0.4rem' }}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenEdit(exp)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleDelete(exp.id)}
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="hireiq-experience-card__subtitle">
                    {exp.companyName} · <span className="hireiq-experience-card__type">{exp.employmentType}</span>
                  </p>
                  <p className="hireiq-experience-card__duration">
                    📅 {calculateDuration(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrentJob)}
                  </p>
                  {exp.location && (
                    <p className="hireiq-experience-card__location">📍 {exp.location}</p>
                  )}
                  <DescriptionText text={exp.description} />
                  {exp.skills && (
                    <div className="hireiq-experience-card__skills">
                      {exp.skills.split(',').map((skill, index) => (
                        <span key={index} className="hireiq-experience-card__skill-chip">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ExperienceModal
          experience={selectedExperience}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this experience?"
      />
    </Card>
  );
};

export default ExperienceCard;
