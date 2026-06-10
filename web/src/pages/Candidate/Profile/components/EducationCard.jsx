import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import Badge from '../../../../components/ui/Badge/Badge';
import EducationModal from './EducationModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { addEducation, updateEducation, deleteEducation } from '../../../../api/profile.api';

export const EducationCard = ({ educations = [], onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const handleOpenAdd = () => {
    setSelectedEducation(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (edu) => {
    setSelectedEducation(edu);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (selectedEducation) {
      await updateEducation(selectedEducation.id, data);
    } else {
      await addEducation(data);
    }
    onRefresh();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteEducation(deleteId);
      setDeleteId(null);
      onRefresh();
    }
  };

  return (
    <Card
      title="🎓 Education"
      action={
        <Button variant="accent" size="sm" onClick={handleOpenAdd}>
          + Add Education
        </Button>
      }
      className="hireiq-profile-page__section-card"
    >
      {educations.length === 0 ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">🎓</span>
          <p className="hireiq-profile-page__empty-text">No education details added yet.</p>
        </div>
      ) : (
        <div className="hireiq-education-list">
          {educations.map((edu) => (
            <div key={edu.id} className="hireiq-education-card">
              <div className="hireiq-education-card__content">
                <div className="hireiq-education-card__title-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 className="hireiq-education-card__title">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </h4>
                    {edu.isAiExtracted && <span className="ai-badge">AI Extracted</span>}
                  </div>
                  <div className="hireiq-education-card__actions" style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenEdit(edu)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleDelete(edu.id)}
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                
                <p className="hireiq-education-card__institute">🏫 {edu.instituteName}</p>
                {edu.boardOrUniversity && (
                  <p className="hireiq-education-card__university">🏛️ {edu.boardOrUniversity}</p>
                )}
                
                <div className="hireiq-education-card__meta-row">
                  <span className="hireiq-education-card__duration">
                    📅 {edu.startYear} – {edu.isCurrentlyStudying ? 'Present' : edu.endYear}
                  </span>
                  {edu.grade && (
                    <span className="hireiq-education-card__grade">
                      🎯 {edu.gradeType}: {edu.grade}
                    </span>
                  )}
                  {edu.isCurrentlyStudying && (
                    <Badge variant="primary">Currently Studying</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <EducationModal
          education={selectedEducation}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this education entry?"
      />
    </Card>
  );
};

export default EducationCard;
