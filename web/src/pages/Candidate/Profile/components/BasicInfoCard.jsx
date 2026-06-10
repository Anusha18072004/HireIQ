import React, { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';

export const BasicInfoCard = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profile?.firstName,
    profile?.lastName,
    profile?.phone,
    profile?.dateOfBirth,
    profile?.gender,
    profile?.city,
    profile?.state,
    profile?.pincode,
    isEditing,
  ]);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone Number is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSave(form);
      setIsEditing(false);
    } catch (err) {
      // Errors handled by parent
    }
  };

  const handleCancel = () => {
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to clear your basic details?')) {
      try {
        await onSave({
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          city: '',
          state: '',
          pincode: '',
        });
      } catch (err) {
        // Handled by parent
      }
    }
  };

  return (
    <Card
      title="👤 Basic Information"
      action={
        !isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              Delete
            </Button>
          </div>
        )
      }
      className="hireiq-profile-page__section-card"
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="hireiq-profile-page__inline-form">
          <div className="hireiq-profile-page__form-grid">
            <FormGroup label="First Name" error={errors.firstName} required>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`hireiq-form-control ${errors.firstName ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Last Name">
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Phone Number" error={errors.phone} required>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`hireiq-form-control ${errors.phone ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Gender">
              <select
                value={form.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="hireiq-form-control"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormGroup>

            <FormGroup label="City" error={errors.city} required>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`hireiq-form-control ${errors.city ? 'hireiq-form-control--error' : ''}`}
              />
            </FormGroup>

            <FormGroup label="State">
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="hireiq-form-control"
              />
            </FormGroup>

            <FormGroup label="Pincode">
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
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
      ) : (
        <div className="hireiq-profile-page__grid hireiq-profile-page__grid--2col">
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Name</span>
            <span className="hireiq-profile-page__info-value">
              {profile?.firstName
                ? `${profile.firstName} ${profile.lastName || ''}`
                : profile?.fullName || '-'}
            </span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Phone</span>
            <span className="hireiq-profile-page__info-value">{profile?.phone || '-'}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Date of Birth</span>
            <span className="hireiq-profile-page__info-value">
              {profile?.dateOfBirth || '-'}
            </span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Gender</span>
            <span className="hireiq-profile-page__info-value">{profile?.gender || '-'}</span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Location</span>
            <span className="hireiq-profile-page__info-value">
              {profile?.city
                ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}`
                : '-'}
            </span>
          </div>
          <div className="hireiq-profile-page__info-item">
            <span className="hireiq-profile-page__info-label">Pincode</span>
            <span className="hireiq-profile-page__info-value">{profile?.pincode || '-'}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BasicInfoCard;
