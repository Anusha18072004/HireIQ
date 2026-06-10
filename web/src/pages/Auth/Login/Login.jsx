import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import FormGroup from '../../../components/forms/FormGroup/FormGroup';
import { validateEmail, validatePassword } from '../../../utils/validators';
import './Login.css';

export const Login = () => {
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
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

    // Validate fields
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);

    if (emailErr || passErr) {
      setFieldErrors({
        email: emailErr,
        password: passErr,
      });
      return;
    }

    try {
      const data = await login(form.email, form.password);
      navigate(data.role === 'RECRUITER' ? '/recruiter/jobs' : '/jobs');
    } catch (err) {
      setSubmitError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="hireiq-login-page">
      <Card className="hireiq-login-page__card">
        <div className="hireiq-login-page__header">
          <h1 className="hireiq-login-page__title">Welcome back</h1>
          <p className="hireiq-login-page__subtitle">Sign in to your HireIQ account</p>
        </div>

        {(submitError || authError) && (
          <Alert variant="error" className="hireiq-login-page__alert">
            {submitError || authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="hireiq-login-page__form">
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="hireiq-form-control hireiq-password-input"
                required
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

          <Button
            type="submit"
            variant="primary"
            loading={authLoading}
            fullWidth
            className="hireiq-login-page__submit-btn"
          >
            Sign In
          </Button>
        </form>

        <p className="hireiq-login-page__footer">
          Don't have an account?{' '}
          <Link to="/register" className="hireiq-login-page__link">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
