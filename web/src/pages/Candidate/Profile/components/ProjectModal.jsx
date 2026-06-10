import React, { useState, useEffect } from 'react';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';
import Button from '../../../../components/ui/Button/Button';

export const ProjectModal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({
    projectTitle: '',
    projectDescription: '',
    technologiesUsed: '',
    projectUrl: '',
    githubUrl: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isOngoing: false,
    orderIndex: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        projectTitle: project.projectTitle || '',
        projectDescription: project.projectDescription || '',
        technologiesUsed: project.technologiesUsed || '',
        projectUrl: project.projectUrl || '',
        githubUrl: project.githubUrl || '',
        startMonth: project.startMonth || '',
        startYear: project.startYear || '',
        endMonth: project.endMonth || '',
        endYear: project.endYear || '',
        isOngoing: !!project.isOngoing,
        orderIndex: project.orderIndex || 0,
      });
    }
  }, [project]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!form.projectDescription.trim()) newErrors.projectDescription = 'Description is required';
    if (!form.startMonth) newErrors.startMonth = 'Start month is required';
    if (!form.startYear) newErrors.startYear = 'Start year is required';
    
    if (!form.isOngoing) {
      if (!form.endMonth) newErrors.endMonth = 'End month is required';
      if (!form.endYear) newErrors.endYear = 'End year is required';
      
      if (form.startYear && form.endYear && Number(form.startYear) > Number(form.endYear)) {
        newErrors.endYear = 'End year must be after start year';
      }
    }
    
    if (form.projectUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(form.projectUrl)) {
      newErrors.projectUrl = 'Please enter a valid URL';
    }
    if (form.githubUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(form.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({
        ...form,
        startYear: form.startYear ? Number(form.startYear) : null,
        endYear: form.isOngoing ? null : (form.endYear ? Number(form.endYear) : null),
        endMonth: form.isOngoing ? '' : form.endMonth,
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message || 'Operation failed.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

  return (
    <div className="hireiq-modal-backdrop">
      <div className="hireiq-modal" role="dialog" aria-modal="true">
        <div className="hireiq-modal__header">
          <h3 className="hireiq-modal__title">
            {project ? '✏️ Edit Project' : '🚀 Add Project'}
          </h3>
          <button type="button" className="hireiq-modal__close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hireiq-modal__form">
          {errors.form && <div className="hireiq-modal__alert-error">{errors.form}</div>}

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Project Title" error={errors.projectTitle} required>
              <input
                type="text"
                placeholder="e.g. E-Commerce Platform"
                value={form.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                className={`hireiq-form-control ${errors.projectTitle ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Technologies Used (comma separated)">
              <input
                type="text"
                placeholder="e.g. React, Node.js, MongoDB"
                value={form.technologiesUsed}
                onChange={(e) => handleInputChange('technologiesUsed', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Project URL" error={errors.projectUrl}>
              <input
                type="text"
                placeholder="e.g. https://myproject.com"
                value={form.projectUrl}
                onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                className={`hireiq-form-control ${errors.projectUrl ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="GitHub Repository URL" error={errors.githubUrl}>
              <input
                type="text"
                placeholder="e.g. https://github.com/user/repo"
                value={form.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                className={`hireiq-form-control ${errors.githubUrl ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>
          </div>

          <div className="hireiq-modal__current-job-wrap">
            <label className="hireiq-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.isOngoing}
                onChange={(e) => handleInputChange('isOngoing', e.target.checked)}
                className="hireiq-modal__checkbox"
              />
              <span>Ongoing Project</span>
            </label>
          </div>

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Start Month" error={errors.startMonth} required>
              <select
                value={form.startMonth}
                onChange={(e) => handleInputChange('startMonth', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Start Year" error={errors.startYear} required>
              <select
                value={form.startYear}
                onChange={(e) => handleInputChange('startYear', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </FormGroup>

            {!form.isOngoing && (
              <>
                <FormGroup label="End Month" error={errors.endMonth} required>
                  <select
                    value={form.endMonth}
                    onChange={(e) => handleInputChange('endMonth', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup label="End Year" error={errors.endYear} required>
                  <select
                    value={form.endYear}
                    onChange={(e) => handleInputChange('endYear', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </FormGroup>
              </>
            )}
          </div>

          <FormGroup label="Project Description" error={errors.projectDescription} required>
            <textarea
              placeholder="Provide key details about your project, your role, and what you achieved..."
              value={form.projectDescription}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              className={`hireiq-form-control ${errors.projectDescription ? 'hireiq-form-control--error' : ''}`}
              rows={4}
            />
          </FormGroup>

          <div className="hireiq-modal__actions">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
