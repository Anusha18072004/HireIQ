import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import ProjectModal from './ProjectModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { addProject, updateProject, deleteProject } from '../../../../api/profile.api';

export const ProjectsCard = ({ projects = [], onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const handleOpenAdd = () => {
    setSelectedProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setSelectedProject(proj);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (selectedProject) {
      await updateProject(selectedProject.id, data);
    } else {
      await addProject(data);
    }
    onRefresh();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProject(deleteId);
      setDeleteId(null);
      onRefresh();
    }
  };

  const DescriptionText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;
    if (text.length <= 150) return <p className="hireiq-project-card__desc">{text}</p>;

    return (
      <p className="hireiq-project-card__desc">
        {expanded ? text : `${text.slice(0, 150)}...`}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="hireiq-project-card__more-btn"
        >
          {expanded ? ' Read less' : ' Read more'}
        </button>
      </p>
    );
  };

  return (
    <Card
      title="🚀 Projects"
      action={
        <Button variant="accent" size="sm" onClick={handleOpenAdd}>
          + Add Project
        </Button>
      }
      className="hireiq-profile-page__section-card"
    >
      {projects.length === 0 ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">🚀</span>
          <p className="hireiq-profile-page__empty-text">No projects added yet.</p>
        </div>
      ) : (
        <div className="hireiq-project-list">
          {projects.map((proj) => (
            <div key={proj.id} className="hireiq-project-card">
              <div className="hireiq-project-card__content">
                <div className="hireiq-project-card__title-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 className="hireiq-project-card__title">{proj.projectTitle}</h4>
                    {proj.isAiExtracted && <span className="ai-badge">AI Extracted</span>}
                  </div>
                  <div className="hireiq-project-card__actions" style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenEdit(proj)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleDelete(proj.id)}
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="hireiq-project-card__duration">
                  📅 {proj.startMonth} {proj.startYear} – {proj.isOngoing ? 'Ongoing' : `${proj.endMonth} ${proj.endYear}`}
                </p>

                <DescriptionText text={proj.projectDescription} />

                {proj.technologiesUsed && (
                  <div className="hireiq-project-card__tech">
                    {proj.technologiesUsed.split(',').map((tech, index) => (
                      <span key={index} className="hireiq-project-card__tech-chip">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hireiq-project-card__links">
                  {proj.projectUrl && (
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hireiq-project-card__link"
                    >
                      🔗 Live Demo
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hireiq-project-card__link"
                    >
                      🐙 GitHub Repo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this project?"
      />
    </Card>
  );
};

export default ProjectsCard;
