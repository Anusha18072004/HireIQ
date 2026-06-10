import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApplications from '../../../hooks/useApplications';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import Card from '../../../components/ui/Card/Card';
import Badge from '../../../components/ui/Badge/Badge';
import ScoreBar from '../../../components/ui/ScoreBar/ScoreBar';
import Button from '../../../components/ui/Button/Button';
import EmptyState from '../../../components/ui/EmptyState/EmptyState';
import SkeletonCard from '../../../components/ui/SkeletonCard/SkeletonCard';
import SuggestionPanel from '../../../components/features/SuggestionPanel/SuggestionPanel';
import { formatDate } from '../../../utils/formatDate';
import { getScoreColor } from '../../../utils/scoreHelpers';
import './Applications.css';

export const Applications = () => {
  const navigate = useNavigate();
  const { data: apps, loading } = useApplications();

  // Track expanded prep copilot panels
  const [expandedApps, setExpandedApps] = useState({});
  // Track active sub-tabs for each application
  const [appTabs, setAppTabs] = useState({});

  const toggleExpand = (appId) => {
    setExpandedApps((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const setAppTab = (appId, tab) => {
    setAppTabs((prev) => ({
      ...prev,
      [appId]: tab,
    }));
  };

  if (loading && apps.length === 0) {
    return (
      <PageWrapper title="My Applications" subtitle="Track your job applications and test results">
        <SkeletonCard count={3} lines={3} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Applications"
      subtitle="Track your job applications and test results"
      className="hireiq-apps-page"
    >
      {apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse jobs and apply to get started"
          icon="📁"
          action={
            <Button variant="primary" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          }
        />
      ) : (
        <div className="hireiq-apps-page__list">
          {apps.map((app) => {
            const isExpanded = !!expandedApps[app.id];
            const defaultTab = app.status === 'REJECTED' 
              ? 'honest' 
              : (app.status === 'TEST_FAILED' ? 'testFeedback' : 'tailor');
            const activeTab = appTabs[app.id] || defaultTab;

            return (
              <Card key={app.id} className="hireiq-apps-page__card">
                <div className="hireiq-apps-page__row">
                  <div className="hireiq-apps-page__details">
                    <h3 className="hireiq-apps-page__job-title">{app.jobTitle}</h3>
                    <p className="hireiq-apps-page__company">🏢 {app.recruiterName}</p>
                    {app.matchReason && (
                      <p className="hireiq-apps-page__reason">
                        💡 {app.matchReason}
                      </p>
                    )}
                  </div>

                  <div className="hireiq-apps-page__status">
                    <Badge
                      variant={
                        app.status === 'SHORTLISTED' || app.status === 'TEST_PASSED' || app.status === 'HIRED'
                          ? 'success'
                          : app.status === 'REJECTED'
                          ? 'danger'
                          : app.status === 'TEST_FAILED'
                          ? 'warning'
                          : 'gray'
                      }
                    >
                      {app.status.replace('_', ' ')}
                    </Badge>
                    {app.matchScore != null && (
                      <div className="hireiq-apps-page__score-wrap">
                        <div
                          className="hireiq-apps-page__score-num"
                          style={{ color: getScoreColor(app.matchScore) }}
                        >
                          {app.matchScore}% Match
                        </div>
                        <ScoreBar score={app.matchScore} showText={false} className="hireiq-apps-page__score-bar" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="hireiq-apps-page__actions">
                  {app.status === 'SHORTLISTED' && (
                    <Button variant="primary" onClick={() => navigate(`/test/${app.jobId}`)}>
                      🧠 Take AI Test
                    </Button>
                  )}
                  {(app.status === 'TEST_FAILED' || app.status === 'TEST_PASSED') && (
                    <Button variant="outline" onClick={() => navigate(`/test/${app.jobId}`)}>
                      📊 Review Test Result
                    </Button>
                  )}
                  {app.status === 'TEST_PASSED' && (
                    <Badge variant="success" className="hireiq-apps-page__pass-badge">
                      ✓ Test Passed — Recruiter has been notified
                    </Badge>
                  )}
                  <span className="hireiq-apps-page__date">
                    Applied {formatDate(app.appliedAt)}
                  </span>
                </div>

                {/* Prep Copilot Section */}
                {(app.tailoringSuggestions || app.honestReview || app.testWeakTopics) && (
                  <div className="hireiq-apps-page__copilot">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => toggleExpand(app.id)}
                      className={`hireiq-apps-page__copilot-toggle ${
                        isExpanded ? 'hireiq-apps-page__copilot-toggle--expanded' : ''
                      }`}
                    >
                      <span>🧠</span>
                      <span>{isExpanded ? 'Hide AI Prep Copilot' : 'Show AI Prep Copilot'}</span>
                      <span>{isExpanded ? '▲' : '▼'}</span>
                    </Button>

                    {isExpanded && (
                      <div className="hireiq-apps-page__copilot-content">
                        {/* Sub tabs */}
                        <div className="hireiq-apps-page__copilot-tabs">
                          {app.honestReview && (
                            <button
                              onClick={() => setAppTab(app.id, 'honest')}
                              className={`hireiq-apps-page__copilot-tab-btn ${
                                activeTab === 'honest' ? 'hireiq-apps-page__copilot-tab-btn--active' : ''
                              }`}
                            >
                              🧐 Honest Review
                            </button>
                          )}
                          {app.testWeakTopics && (
                            <button
                              onClick={() => setAppTab(app.id, 'testFeedback')}
                              className={`hireiq-apps-page__copilot-tab-btn ${
                                activeTab === 'testFeedback' ? 'hireiq-apps-page__copilot-tab-btn--active' : ''
                              }`}
                            >
                              📊 Test Feedback
                            </button>
                          )}
                          <button
                            onClick={() => setAppTab(app.id, 'tailor')}
                            className={`hireiq-apps-page__copilot-tab-btn ${
                              activeTab === 'tailor' ? 'hireiq-apps-page__copilot-tab-btn--active' : ''
                            }`}
                          >
                            🎯 Tailoring
                          </button>
                          <button
                            onClick={() => setAppTab(app.id, 'interview')}
                            className={`hireiq-apps-page__copilot-tab-btn ${
                              activeTab === 'interview' ? 'hireiq-apps-page__copilot-tab-btn--active' : ''
                            }`}
                          >
                            💬 Interview Prep
                          </button>
                          <button
                            onClick={() => setAppTab(app.id, 'roadmap')}
                            className={`hireiq-apps-page__copilot-tab-btn ${
                              activeTab === 'roadmap' ? 'hireiq-apps-page__copilot-tab-btn--active' : ''
                            }`}
                          >
                            📈 Skill Roadmap
                          </button>
                        </div>

                        {/* Rendering mapped AI suggestions using SuggestionPanel */}
                        <div className="hireiq-apps-page__copilot-panel-wrap">
                          <SuggestionPanel
                            type={activeTab === 'testFeedback' ? 'test' : 'match'}
                            suggestion={
                              activeTab === 'testFeedback'
                                ? {
                                    weakTopics: app.testWeakTopics,
                                    strengths: app.testStrengths,
                                    improvementSuggestions: app.testImprovementSuggestions,
                                    lastScore: app.testScore,
                                  }
                                : {
                                    honestReview: activeTab === 'honest' ? app.honestReview : '',
                                    tailoringSuggestions: activeTab === 'tailor' ? app.tailoringSuggestions : '',
                                    interviewTips: activeTab === 'interview' ? app.interviewTips : '',
                                    upskillingRoadmap: activeTab === 'roadmap' ? app.upskillingRoadmap : '',
                                  }
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

export default Applications;
