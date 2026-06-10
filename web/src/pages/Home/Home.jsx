import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import './Home.css';

const scoreRules = [
  {
    score: '≥ 75%',
    label: 'Pass',
    desc: 'Profile shown to recruiter',
    variant: 'success',
    color: 'var(--success)',
  },
  {
    score: '50–74%',
    label: 'Retry in 4 days',
    desc: 'New AI questions generated',
    variant: 'orange',
    color: 'var(--warning)',
  },
  {
    score: '30–49%',
    label: 'Retry in 10 days',
    desc: 'New AI questions generated',
    variant: 'orange',
    color: 'var(--warning)',
  },
  {
    score: '< 30%',
    label: 'Retry in 30 days',
    desc: 'New AI questions generated',
    variant: 'purple',
    color: 'var(--danger)',
  },
];

const features = [
  {
    icon: '📄',
    title: 'Resume Parsing',
    desc: 'Upload your PDF resume. AI extracts your skills and experience automatically.',
    variant: 'blue',
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    desc: 'Apply for a job and get an instant AI match score. Only 75%+ candidates proceed.',
    variant: 'orange',
  },
  {
    icon: '🧠',
    title: 'AI Skill Test',
    desc: 'Shortlisted candidates take a 20-question AI test tailored to the role.',
    variant: 'purple',
  },
];

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="hireiq-home">
      {/* Hero Section */}
      <section className="hireiq-home__hero">
        <div className="container">
          <h1 className="hireiq-home__hero-title">
            Smart Hiring, Powered by AI
          </h1>
          <p className="hireiq-home__hero-subtitle">
            AI parses your resume, scores your match, and generates role-specific tests —
            so only the best candidates reach recruiters.
          </p>
          <div className="hireiq-home__hero-actions">
            {user ? (
              <Link to={user.role === 'RECRUITER' ? '/recruiter/jobs' : '/jobs'}>
                <Button variant="accent" size="lg">
                  Go to Dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="accent" size="lg">Get Started Free</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hireiq-home__features">
        <div className="container">
          <h2 className="hireiq-home__section-title">How HireIQ Works</h2>
          <div className="hireiq-home__features-grid">
            {features.map((f, i) => (
              <Card
                key={f.title}
                variant={f.variant}
                className="hireiq-home__feature-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="hireiq-home__feature-icon">{f.icon}</div>
                <h3 className="hireiq-home__feature-title">{f.title}</h3>
                <p className="hireiq-home__feature-desc">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="hireiq-home__rules-section">
        <div className="container">
          <div className="hireiq-home__rules-panel">
            <h3 className="hireiq-home__rules-title">Test Score Rules</h3>
            <div className="hireiq-home__rules-grid">
              {scoreRules.map((r, i) => (
                <div
                  key={r.score}
                  className={`hireiq-home__rule-card hireiq-home__rule-card--${r.variant}`}
                  style={{
                    '--rule-color': r.color,
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  <div className="hireiq-home__rule-score">{r.score}</div>
                  <div className="hireiq-home__rule-label">{r.label}</div>
                  <div className="hireiq-home__rule-desc">{r.desc}</div>
                </div>
              ))}
            </div>
            <p className="hireiq-home__rules-legend">
              Every retry generates completely new AI questions
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
