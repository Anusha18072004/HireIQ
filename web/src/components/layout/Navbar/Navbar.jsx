import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../ui/Button/Button';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <nav className="hireiq-navbar">
      <div className="container hireiq-navbar__container">
        <Link to="/" className="hireiq-navbar__brand">
          Hire<span className="hireiq-navbar__brand-span">IQ</span>
        </Link>

        <div className="hireiq-navbar__links">
          {user ? (
            <>
              <span className="hireiq-navbar__user">👋 {user.fullName}</span>
              {user.role === 'CANDIDATE' && (
                <>
                  <Link to="/jobs" className="hireiq-navbar__link">Browse Jobs</Link>
                  <Link to="/profile" className="hireiq-navbar__link">My Profile</Link>
                  <Link to="/applications" className="hireiq-navbar__link">Applications</Link>
                </>
              )}
              {user.role === 'RECRUITER' && (
                <>
                  <Link to="/recruiter/jobs" className="hireiq-navbar__link">My Jobs</Link>
                  <Link to="/recruiter/post-job" className="hireiq-navbar__link">Post Job</Link>
                </>
              )}
              <button
                onClick={toggleTheme}
                className="hireiq-navbar__theme-toggle"
                aria-label="Toggle theme"
              >
                {isDark ? '☀ Light' : '🌙 Dark'}
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hireiq-navbar__logout-btn"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={toggleTheme}
                className="hireiq-navbar__theme-toggle"
                aria-label="Toggle theme"
              >
                {isDark ? '☀ Light' : '🌙 Dark'}
              </button>
              <Link to="/login" className="hireiq-navbar__link">Login</Link>
              <Link to="/register" className="hireiq-navbar__register-btn">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
