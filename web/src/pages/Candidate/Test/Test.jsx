import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTest from '../../../hooks/useTest';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import Badge from '../../../components/ui/Badge/Badge';
import Alert from '../../../components/ui/Alert/Alert';
import Spinner from '../../../components/ui/Spinner/Spinner';
import TestTimer from '../../../components/features/TestTimer/TestTimer';
import TestQuestion from '../../../components/features/TestQuestion/TestQuestion';
import SuggestionPanel from '../../../components/features/SuggestionPanel/SuggestionPanel';
import { getScoreColor } from '../../../utils/scoreHelpers';
import { formatLongDate } from '../../../utils/formatDate';
import './Test.css';

export const Test = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('status'); // status | test | result
  const [timer, setTimer] = useState(30 * 60); // 30 mins
  const [currentIdx, setCurrentIdx] = useState(0);
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  const {
    data: status,
    loading: loadingStatus,
    error: statusError,
    attempt,
    answers,
    setAnswers,
    result,
    start,
    submit,
  } = useTest(jobId);

  const [submitting, setSubmitting] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (phase !== 'test') return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleStart = async () => {
    try {
      await start();
      setPhase('test');
      setTimer(30 * 60);
      setCurrentIdx(0);
    } catch (err) {
      // Error is caught by useTest
    }
  };

  const handleSubmit = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    try {
      await submit(attempt.attemptId, answers);
      setPhase('result');
    } catch (err) {
      alert(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    try {
      await submit(attempt.attemptId, answers);
      setPhase('result');
    } catch (err) {
      console.error('Auto submission failed', err);
    } finally {
      setSubmitting(false);
    }
  }, [attempt, answers, submit, submitting]);

  const handleOptionSelect = (qNum, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: option,
    }));
  };

  if (loadingStatus && phase === 'status') {
    return (
      <div className="loading-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── PHASE 1: STATUS ──
  if (phase === 'status') {
    if (statusError || status?.error) {
      return (
        <PageWrapper className="hireiq-test-page">
          <div className="hireiq-test-page__centered-container">
            <Alert variant="error">{statusError || status?.error}</Alert>
            <Button variant="outline" onClick={() => navigate('/applications')}>
              ← Back to Applications
            </Button>
          </div>
        </PageWrapper>
      );
    }

    const hasLastScore = status?.lastScore != null;

    return (
      <PageWrapper className="hireiq-test-page">
        <div className="hireiq-test-page__centered-container">
          <Card className="hireiq-test-page__status-card">
            <div className="hireiq-test-page__icon">🧠</div>
            <h2 className="hireiq-test-page__title">AI Skill Assessment</h2>
            <p className="hireiq-test-page__job-title-desc">
              {status?.jobTitle || 'Job Assessment'}
            </p>

            {hasLastScore && (
              <div className="hireiq-test-page__last-score-panel">
                <span className="hireiq-test-page__last-score-label">Last attempt score</span>
                <span
                  className="hireiq-test-page__last-score-val"
                  style={{ color: getScoreColor(status.lastScore) }}
                >
                  {status.lastScore}%
                </span>
              </div>
            )}

            {hasLastScore && status?.weakTopics && (
              <div className="hireiq-test-page__feedback-toggle-section">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setExpandedFeedback(!expandedFeedback)}
                  className="hireiq-test-page__feedback-toggle-btn"
                >
                  <span>🧠</span>
                  <span>
                    {expandedFeedback ? 'Hide AI Coaching Feedback' : 'Review Previous Attempt AI Feedback'}
                  </span>
                  <span>{expandedFeedback ? '▲' : '▼'}</span>
                </Button>

                {expandedFeedback && (
                  <div className="hireiq-test-page__previous-coaching">
                    <SuggestionPanel
                      type="test"
                      suggestion={{
                        weakTopics: status.weakTopics,
                        strengths: status.strengths,
                        improvementSuggestions: status.improvementSuggestions,
                        lastScore: status.lastScore,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="hireiq-test-page__rules-alert">
              <Alert variant="info">
                <strong>Test Rules:</strong>
                <ul className="hireiq-test-page__rules-list">
                  <li>20 AI-generated multiple choice questions</li>
                  <li>30 minutes time limit</li>
                  <li>Score ≥ 75% to pass</li>
                  <li>Score 50-74%: retry after 4 days</li>
                  <li>Score 30-49%: retry after 10 days</li>
                  <li>Score below 30%: retry after 30 days</li>
                  <li>Each retry has completely new questions</li>
                </ul>
              </Alert>
            </div>

            {status?.canAttempt ? (
              <Button
                variant="primary"
                fullWidth
                onClick={handleStart}
                loading={loadingStatus}
              >
                Start Test →
              </Button>
            ) : (
              <div>
                <Alert variant="error">{status?.message}</Alert>
                <Button variant="outline" fullWidth onClick={() => navigate('/applications')}>
                  ← Back to Applications
                </Button>
              </div>
            )}
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ── PHASE 2: TESTING ──
  if (phase === 'test' && attempt) {
    const questions = attempt.questions;
    const currentQuestion = questions[currentIdx];
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;
    const selectedOption = answers[currentQuestion.questionNumber] || '';

    return (
      <PageWrapper className="hireiq-test-page">
        <div className="hireiq-test-page__test-container">
          {/* Header Panel */}
          <div className="hireiq-test-page__test-header">
            <div className="hireiq-test-page__question-progress">
              <span className="hireiq-test-page__question-index-label">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="hireiq-test-page__question-answered-count">
                {answeredCount} answered
              </span>
            </div>

            <TestTimer seconds={timer} />

            <div className="hireiq-test-page__attempt-label">
              Attempt #{attempt.attemptNumber}
            </div>
          </div>

          {/* Progress bar */}
          <div className="hireiq-test-page__progress-track">
            <div
              className="hireiq-test-page__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question area */}
          <TestQuestion
            question={currentQuestion}
            selectedOption={selectedOption}
            onOptionSelect={handleOptionSelect}
            questionIndex={currentIdx}
            className="hireiq-test-page__question-block"
          />

          {/* Navigations */}
          <div className="hireiq-test-page__nav-buttons">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))}
              disabled={currentIdx === 0}
            >
              ← Previous
            </Button>

            {/* Circular navigation dots */}
            <div className="hireiq-test-page__dots">
              {questions.map((_, idx) => {
                const qNum = questions[idx].questionNumber;
                const isCurrent = currentIdx === idx;
                const isAnswered = !!answers[qNum];

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`hireiq-test-page__dot ${
                      isCurrent ? 'hireiq-test-page__dot--current' : ''
                    } ${isAnswered ? 'hireiq-test-page__dot--answered' : ''}`}
                    aria-label={`Go to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIdx < questions.length - 1 ? (
              <Button variant="primary" onClick={() => setCurrentIdx((c) => c + 1)}>
                Next →
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} loading={submitting}>
                Submit Test ✓
              </Button>
            )}
          </div>

          {/* Submit all answers helper bar */}
          {answeredCount === questions.length && (
            <div className="hireiq-test-page__full-submit-helper">
              <Button variant="success" fullWidth onClick={handleSubmit} loading={submitting}>
                ✓ Submit All Answers
              </Button>
            </div>
          )}
        </div>
      </PageWrapper>
    );
  }

  // ── PHASE 3: RESULT ──
  if (phase === 'result' && result) {
    const passed = result.status === 'PASSED';
    const scoreColor = getScoreColor(result.score);

    return (
      <PageWrapper className="hireiq-test-page">
        <div className="hireiq-test-page__centered-container">
          <Card className="hireiq-test-page__result-card">
            <div className="hireiq-test-page__icon">
              {passed ? '🎉' : '📚'}
            </div>
            <h2 className="hireiq-test-page__title">
              {passed ? 'Test Passed!' : 'Better Luck Next Time'}
            </h2>

            <div
              className="hireiq-test-page__grade-panel"
              style={{
                background: passed ? 'var(--success-lt)' : 'var(--danger-lt)',
              }}
            >
              <span
                className="hireiq-test-page__grade-val"
                style={{ color: scoreColor }}
              >
                {result.score}%
              </span>
              <p className="hireiq-test-page__grade-details">
                {result.correctAnswers} correct out of {result.totalQuestions} questions
              </p>
            </div>

            <p className="hireiq-test-page__result-message">{result.message}</p>

            {result.weakTopics && (
              <div className="hireiq-test-page__result-coaching">
                <h3 className="hireiq-test-page__coaching-title">
                  🧠 AI Performance Coaching Feedback
                </h3>
                <SuggestionPanel
                  type="test"
                  suggestion={{
                    weakTopics: result.weakTopics,
                    strengths: result.strengths,
                    improvementSuggestions: result.improvementSuggestions,
                    lastScore: result.score,
                  }}
                />
              </div>
            )}

            {result.nextAllowedAt && (
              <Alert variant="info" className="hireiq-test-page__next-allowed-alert">
                Next attempt allowed on:{' '}
                <strong>{formatLongDate(result.nextAllowedAt)}</strong>
              </Alert>
            )}

            <div className="hireiq-test-page__result-actions">
              <Button
                variant="outline"
                onClick={() => navigate('/applications')}
                className="hireiq-test-page__action-btn"
              >
                My Applications
              </Button>
              {!passed && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/jobs')}
                  className="hireiq-test-page__action-btn"
                >
                  Browse More Jobs
                </Button>
              )}
            </div>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return null;
};

export default Test;
