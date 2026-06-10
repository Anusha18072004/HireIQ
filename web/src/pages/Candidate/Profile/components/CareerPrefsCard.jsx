import React, { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';

export const CareerPrefsCard = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    noticePeriod: '',
    currentSalary: '',
    expectedSalary: '',
    preferredJobType: '',
    preferredLocations: '',
    availableFrom: '',
  });

  const currentYear = new Date().getFullYear();
  const isFresher = (profile?.educations || []).some(
    edu => edu.isCurrentlyStudying || (edu.endYear && Number(edu.endYear) >= currentYear)
  );

  useEffect(() => {
    if (profile) {
      setForm({
        noticePeriod: isFresher ? '0' : (profile.noticePeriod || ''),
        currentSalary: isFresher ? '0' : (profile.currentSalary || ''),
        expectedSalary: profile.expectedSalary || '',
        preferredJobType: profile.preferredJobType || '',
        preferredLocations: profile.preferredLocations || '',
        availableFrom: profile.availableFrom || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profile?.noticePeriod,
    profile?.currentSalary,
    profile?.expectedSalary,
    profile?.preferredJobType,
    profile?.preferredLocations,
    profile?.availableFrom,
    isEditing,
    isFresher,
  ]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionForm = {
        ...form,
        currentSalary: isFresher ? '0' : form.currentSalary,
        noticePeriod: isFresher ? '0' : form.noticePeriod,
      };
      await onSave(submissionForm);
      setIsEditing(false);
    } catch (err) {
      // Errors handled by parent
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const hasPrefs = !!(
    profile?.noticePeriod ||
    profile?.currentSalary ||
    profile?.expectedSalary ||
    profile?.preferredJobType ||
    profile?.preferredLocations ||
    profile?.availableFrom
  );

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to clear your career preferences?')) {
      try {
        await onSave({
          noticePeriod: '',
          currentSalary: '',
          expectedSalary: '',
          preferredJobType: '',
          preferredLocations: '',
          availableFrom: '',
        });
      } catch (err) {
        // Handled by parent
      }
    }
  };

  return (
    <Card
      title="💼 Career Preferences"
      action={
        !isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            {hasPrefs && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                Delete
              </Button>
            )}
          </div>
        )
      }
      className="hireiq-profile-page__section-card"
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="hireiq-profile-page__inline-form">
          <div className="hireiq-profile-page__form-grid">
            <FormGroup label="Notice Period">
              <select
                value={isFresher ? '0' : form.noticePeriod}
                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                className="hireiq-form-control"
                disabled={isFresher}
              >
                {isFresher ? (
                  <option value="0">0 days</option>
                ) : (
                  <>
                    <option value="">Select Notice Period</option>
                    <option value="Immediately">Immediately</option>
                    <option value="15 days">15 days</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                  </>
                )}
              </select>
            </FormGroup>

            <FormGroup label="Current Salary">
              <input
                type="text"
                placeholder={isFresher ? "0" : "e.g. 3.5 LPA"}
                value={isFresher ? "0" : form.currentSalary}
                onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                className="hireiq-form-control"
                disabled={isFresher}
              />
            </FormGroup>

            <FormGroup label="Expected Salary">
              <input
                type="text"
                placeholder="e.g. 6.0 LPA"
                value={form.expectedSalary}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Preferred Job Type">
              <select
                value={form.preferredJobType}
                onChange={(e) => handleInputChange('preferredJobType', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Select Job Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </FormGroup>

            <FormGroup label="Preferred Locations (comma separated)">
              <input
                type="text"
                placeholder="e.g. Bangalore, Mumbai"
                value={form.preferredLocations}
                onChange={(e) => handleInputChange('preferredLocations', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Available From">
              <input
                type="date"
                value={form.availableFrom}
                onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>
          </div>

          <div className="hireiq-profile-page__form-actions">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit">
              Save
            </Button>
          </div>
        </form>
      ) : !hasPrefs ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">💼</span>
          <p className="hireiq-profile-page__empty-text">No career preferences specified yet.</p>
          <Button variant="accent" size="sm" onClick={() => setIsEditing(true)} style={{ marginTop: '0.75rem' }}>
            + Add Preferences
          </Button>
        </div>
      ) : (
        <div className="hireiq-profile-page__grid hireiq-profile-page__grid--2col">
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Notice Period</span>
            <span className="hireiq-profile-page__info-value">{isFresher ? '0 days' : (profile?.noticePeriod || '-')}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Current Salary</span>
            <span className="hireiq-profile-page__info-value">{isFresher ? '0' : (profile?.currentSalary || '-')}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Expected Salary</span>
            <span className="hireiq-profile-page__info-value">{profile?.expectedSalary || '-'}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Preferred Job Type</span>
            <span className="hireiq-profile-page__info-value">{profile?.preferredJobType || '-'}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Preferred Locations</span>
            <span className="hireiq-profile-page__info-value">{profile?.preferredLocations || '-'}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Available From</span>
            <span className="hireiq-profile-page__info-value">{profile?.availableFrom || '-'}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CareerPrefsCard;
