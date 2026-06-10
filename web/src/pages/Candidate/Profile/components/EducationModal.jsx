import React, { useState, useEffect } from 'react';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';
import Button from '../../../../components/ui/Button/Button';

export const EducationModal = ({ education, onClose, onSave }) => {
  const [form, setForm] = useState({
    degree: 'B.Tech',
    fieldOfStudy: '',
    instituteName: '',
    boardOrUniversity: '',
    startYear: '',
    endYear: '',
    grade: '',
    gradeType: 'CGPA',
    isCurrentlyStudying: false,
    orderIndex: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (education) {
      setForm({
        degree: education.degree || 'B.Tech',
        fieldOfStudy: education.fieldOfStudy || '',
        instituteName: education.instituteName || '',
        boardOrUniversity: education.boardOrUniversity || '',
        startYear: education.startYear || '',
        endYear: education.endYear || '',
        grade: education.grade || '',
        gradeType: education.gradeType || 'CGPA',
        isCurrentlyStudying: !!education.isCurrentlyStudying,
        orderIndex: education.orderIndex || 0,
      });
    }
  }, [education]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.degree.trim()) newErrors.degree = 'Degree is required';
    if (!form.instituteName.trim()) newErrors.instituteName = 'Institute name is required';
    if (!form.startYear) newErrors.startYear = 'Start year is required';

    if (!form.isCurrentlyStudying) {
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
        endYear: form.isCurrentlyStudying ? null : (form.endYear ? Number(form.endYear) : null),
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message || 'Operation failed.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => (currentYear + 5) - i);

  return (
    <div className="hireiq-modal-backdrop">
      <div className="hireiq-modal" role="dialog" aria-modal="true">
        <div className="hireiq-modal__header">
          <h3 className="hireiq-modal__title">
            {education ? '✏️ Edit Education' : '🎓 Add Education'}
          </h3>
          <button type="button" className="hireiq-modal__close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hireiq-modal__form">
          {errors.form && <div className="hireiq-modal__alert-error">{errors.form}</div>}

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Degree" error={errors.degree} required>
              <select
                value={form.degree}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc</option>
                <option value="MBA">MBA</option>
                <option value="12th">12th</option>
                <option value="10th">10th</option>
              </select>
            </FormGroup>

            <FormGroup label="Field of Study">
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={form.fieldOfStudy}
                onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Institute Name" error={errors.instituteName} required>
              <input
                type="text"
                placeholder="e.g. IIT Madras"
                value={form.instituteName}
                onChange={(e) => handleInputChange('instituteName', e.target.value)}
                className={`hireiq-form-control ${errors.instituteName ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Board / University">
              <input
                type="text"
                placeholder="e.g. CBSE or Anna University"
                value={form.boardOrUniversity}
                onChange={(e) => handleInputChange('boardOrUniversity', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>
          </div>

          <div className="hireiq-modal__current-job-wrap">
            <label className="hireiq-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.isCurrentlyStudying}
                onChange={(e) => handleInputChange('isCurrentlyStudying', e.target.checked)}
                className="hireiq-modal__checkbox"
              />
              <span>I am currently studying here</span>
            </label>
          </div>

          <div className="hireiq-modal__form-grid">
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

            {!form.isCurrentlyStudying && (
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
            )}

            <FormGroup label="Grade Type">
              <select
                value={form.gradeType}
                onChange={(e) => handleInputChange('gradeType', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="CGPA">CGPA</option>
                <option value="Percentage">Percentage</option>
              </select>
            </FormGroup>

            <FormGroup label="Grade / Score">
              <input
                type="text"
                placeholder="e.g. 9.1 or 88%"
                value={form.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>
          </div>

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

export default EducationModal;
