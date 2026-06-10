import React, { useState, useEffect } from 'react';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';
import Button from '../../../../components/ui/Button/Button';

export const ExperienceModal = ({ experience, onClose, onSave }) => {
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    employmentType: 'Full Time',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrentJob: false,
    description: '',
    skills: '',
    location: '',
    orderIndex: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (experience) {
      setForm({
        companyName: experience.companyName || '',
        jobTitle: experience.jobTitle || '',
        employmentType: experience.employmentType || 'Full Time',
        startMonth: experience.startMonth || '',
        startYear: experience.startYear || '',
        endMonth: experience.endMonth || '',
        endYear: experience.endYear || '',
        isCurrentJob: !!experience.isCurrentJob,
        description: experience.description || '',
        skills: experience.skills || '',
        location: experience.location || '',
        orderIndex: experience.orderIndex || 0,
      });
    }
  }, [experience]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!form.startMonth) newErrors.startMonth = 'Start month is required';
    if (!form.startYear) newErrors.startYear = 'Start year is required';
    
    if (!form.isCurrentJob) {
      if (!form.endMonth) newErrors.endMonth = 'End month is required';
      if (!form.endYear) newErrors.endYear = 'End year is required';
      
      if (form.startYear && form.endYear && Number(form.startYear) > Number(form.endYear)) {
        newErrors.endYear = 'End year must be after start year';
      }
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
        endYear: form.isCurrentJob ? null : (form.endYear ? Number(form.endYear) : null),
        endMonth: form.isCurrentJob ? '' : form.endMonth,
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
            {experience ? '✏️ Edit Work Experience' : '💼 Add Work Experience'}
          </h3>
          <button type="button" className="hireiq-modal__close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hireiq-modal__form">
          {errors.form && <div className="hireiq-modal__alert-error">{errors.form}</div>}

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Job Title" error={errors.jobTitle} required>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={form.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className={`hireiq-form-control ${errors.jobTitle ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Company Name" error={errors.companyName} required>
              <input
                type="text"
                placeholder="e.g. Google India"
                value={form.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className={`hireiq-form-control ${errors.companyName ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Employment Type">
              <select
                value={form.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </FormGroup>

            <FormGroup label="Location">
              <input
                type="text"
                placeholder="e.g. Bangalore, India"
                value={form.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>
          </div>

          <div className="hireiq-modal__current-job-wrap">
            <label className="hireiq-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.isCurrentJob}
                onChange={(e) => handleInputChange('isCurrentJob', e.target.checked)}
                className="hireiq-modal__checkbox"
              />
              <span>I currently work here</span>
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

            {!form.isCurrentJob && (
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

          <FormGroup label="Skills Used (comma separated)">
            <input
              type="text"
              placeholder="e.g. Java, React, Microservices"
              value={form.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className="hireiq-form-control"
            />
          </FormGroup>

          <FormGroup label="Job Description">
            <textarea
              placeholder="Describe your role and key contributions..."
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="hireiq-form-control"
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

export default ExperienceModal;
