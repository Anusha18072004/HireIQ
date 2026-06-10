import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import FormGroup from '../../../components/forms/FormGroup/FormGroup';
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validators';
import './Register.css';

export const Register = () => {
  const { register, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'CANDIDATE' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validations
    const nameErr = validateRequired(form.fullName, 'Full Name');
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);

    if (nameErr || emailErr || passErr) {
      setFieldErrors({
        fullName: nameErr,
        email: emailErr,
        password: passErr,
      });
      return;
    }

    try {
      const res = await register(form.fullName, form.email, form.password, form.role);
      setSuccessMessage(res.message || 'Registration successful! Verification email sent.');
    } catch (err) {
      setSubmitError(err.message || 'Registration failed.');
    }
  };

  if (successMessage) {
    return (
      <div className="hireiq-register-page">
        <Card className="hireiq-register-page__card">
          <div className="hireiq-register-page__header" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✉️</span>
            <h1 className="hireiq-register-page__title">Verify your Email</h1>
            <p className="hireiq-register-page__subtitle">Activation link has been sent</p>
          </div>
          <Alert variant="success" style={{ margin: '1.25rem 0', lineHeight: '1.6' }}>
            {successMessage}
          </Alert>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'center', margin: '1.25rem 0' }}>
            Please make sure to check your spam/junk folder if you do not see the email in your inbox within a few minutes.
          </p>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent)', textDecoration: 'none' }}>
              ← Return to Sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="hireiq-register-page">
      <Card className="hireiq-register-page__card">
        <div className="hireiq-register-page__header">
          <h1 className="hireiq-register-page__title">Create account</h1>
          <p className="hireiq-register-page__subtitle">Join HireIQ today</p>
        </div>

        {(submitError || authError) && (
          <Alert variant="error" className="hireiq-register-page__alert">
            {submitError || authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="hireiq-register-page__form">
          <FormGroup
            label="Full Name"
            error={fieldErrors.fullName}
            required
          >
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="hireiq-form-control"
              required
            />
          </FormGroup>

          <FormGroup
            label="Email"
            error={fieldErrors.email}
            required
          >
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="hireiq-form-control"
              required
            />
          </FormGroup>

          <FormGroup
            label="Password"
            error={fieldErrors.password}
            required
          >
            <div className="hireiq-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="hireiq-form-control hireiq-password-input"
                required
                minLength={6}
              />
              <button
                type="button"
                className="hireiq-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </FormGroup>

          <FormGroup label="I am a" required>
            <div className="hireiq-register-page__role-selector">
              {['CANDIDATE', 'RECRUITER'].map((r) => {
                const isSelected = form.role === r;
                return (
                  <label
                    key={r}
                    className={`hireiq-register-page__role-option ${isSelected ? 'hireiq-register-page__role-option--selected' : ''
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={isSelected}
                      onChange={() => handleInputChange('role', r)}
                      className="hireiq-register-page__role-radio"
                    />
                    <span className="hireiq-register-page__role-label-text">
                      {r === 'CANDIDATE' ? '🎯 Job Seeker' : '🏢 Recruiter'}
                    </span>
                  </label>
                );
              })}
            </div>
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            loading={authLoading}
            fullWidth
            className="hireiq-register-page__submit-btn"
          >
            Create Account
          </Button>
        </form>

        <p className="hireiq-register-page__footer">
          Already have an account?{' '}
          <Link to="/login" className="hireiq-register-page__link">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
