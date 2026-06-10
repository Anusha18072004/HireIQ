import React, { useState, useEffect } from 'react';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';
import Button from '../../../../components/ui/Button/Button';

export const CertModal = ({ certification, onClose, onSave }) => {
  const [form, setForm] = useState({
    certificationName: '',
    issuingOrganization: '',
    issueMonth: '',
    issueYear: '',
    expiryMonth: '',
    expiryYear: '',
    doesNotExpire: false,
    credentialId: '',
    credentialUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (certification) {
      setForm({
        certificationName: certification.certificationName || '',
        issuingOrganization: certification.issuingOrganization || '',
        issueMonth: certification.issueMonth || '',
        issueYear: certification.issueYear || '',
        expiryMonth: certification.expiryMonth || '',
        expiryYear: certification.expiryYear || '',
        doesNotExpire: !!certification.doesNotExpire,
        credentialId: certification.credentialId || '',
        credentialUrl: certification.credentialUrl || '',
      });
    }
  }, [certification]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.certificationName.trim()) newErrors.certificationName = 'Certification name is required';
    if (!form.issuingOrganization.trim()) newErrors.issuingOrganization = 'Issuing organization is required';
    if (!form.issueMonth) newErrors.issueMonth = 'Issue month is required';
    if (!form.issueYear) newErrors.issueYear = 'Issue year is required';
    
    if (!form.doesNotExpire) {
      if (!form.expiryMonth) newErrors.expiryMonth = 'Expiry month is required';
      if (!form.expiryYear) newErrors.expiryYear = 'Expiry year is required';
      
      if (form.issueYear && form.expiryYear && Number(form.issueYear) > Number(form.expiryYear)) {
        newErrors.expiryYear = 'Expiry year must be after issue year';
      }
    }
    
    if (form.credentialUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(form.credentialUrl)) {
      newErrors.credentialUrl = 'Please enter a valid URL';
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
        issueYear: form.issueYear ? Number(form.issueYear) : null,
        expiryYear: form.doesNotExpire ? null : (form.expiryYear ? Number(form.expiryYear) : null),
        expiryMonth: form.doesNotExpire ? '' : form.expiryMonth,
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
            {certification ? '✏️ Edit Certification' : '📜 Add Certification'}
          </h3>
          <button type="button" className="hireiq-modal__close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hireiq-modal__form">
          {errors.form && <div className="hireiq-modal__alert-error">{errors.form}</div>}

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Certification Name" error={errors.certificationName} required>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                value={form.certificationName}
                onChange={(e) => handleInputChange('certificationName', e.target.value)}
                className={`hireiq-form-control ${errors.certificationName ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Issuing Organization" error={errors.issuingOrganization} required>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services"
                value={form.issuingOrganization}
                onChange={(e) => handleInputChange('issuingOrganization', e.target.value)}
                className={`hireiq-form-control ${errors.issuingOrganization ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Credential ID">
              <input
                type="text"
                placeholder="e.g. AWS-123456"
                value={form.credentialId}
                onChange={(e) => handleInputChange('credentialId', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Credential URL" error={errors.credentialUrl}>
              <input
                type="text"
                placeholder="e.g. https://credly.com/..."
                value={form.credentialUrl}
                onChange={(e) => handleInputChange('credentialUrl', e.target.value)}
                className={`hireiq-form-control ${errors.credentialUrl ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>
          </div>

          <div className="hireiq-modal__current-job-wrap">
            <label className="hireiq-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.doesNotExpire}
                onChange={(e) => handleInputChange('doesNotExpire', e.target.checked)}
                className="hireiq-modal__checkbox"
              />
              <span>This credential does not expire</span>
            </label>
          </div>

          <div className="hireiq-modal__form-grid">
            <FormGroup label="Issue Month" error={errors.issueMonth} required>
              <select
                value={form.issueMonth}
                onChange={(e) => handleInputChange('issueMonth', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Issue Year" error={errors.issueYear} required>
              <select
                value={form.issueYear}
                onChange={(e) => handleInputChange('issueYear', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </FormGroup>

            {!form.doesNotExpire && (
              <>
                <FormGroup label="Expiration Month" error={errors.expiryMonth} required>
                  <select
                    value={form.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup label="Expiration Year" error={errors.expiryYear} required>
                  <select
                    value={form.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
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

export default CertModal;
