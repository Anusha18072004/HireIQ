import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card/Card';
import MarkdownRenderer from '../../ui/MarkdownRenderer/MarkdownRenderer';
import './SuggestionPanel.css';

export const SuggestionPanel = ({
  type = 'resume',
  suggestion,
  className = '',
  ...props
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!suggestion) return null;

  const toggleExpand = (idx) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const parseStudyPlan = (markdown) => {
    if (!markdown) return [];
    const items = [];
    const lines = markdown.split('\n');
    let currentHeader = '';
    let currentContent = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
        if (currentHeader) {
          items.push({
            title: currentHeader,
            content: currentContent.join('\n'),
          });
        }
        currentHeader = trimmed.replace(/^#+\s*/, '');
        currentContent = [];
      } else {
        if (trimmed !== '' || currentContent.length > 0) {
          currentContent.push(line);
        }
      }
    });

    if (currentHeader) {
      items.push({
        title: currentHeader,
        content: currentContent.join('\n'),
      });
    }

    if (items.length === 0 && markdown.trim()) {
      items.push({
        title: 'Study Plan Details',
        content: markdown,
      });
    }

    return items;
  };

  const renderResumeSuggestions = () => {
    return (
      <div className="hireiq-suggestion-panel__grid">
        {suggestion.resumeFeedback && (
          <Card
            title="🟢 Resume Audit & Strengths"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--green"
          >
            <MarkdownRenderer content={suggestion.resumeFeedback} />
          </Card>
        )}

        {suggestion.skillGaps && (
          <Card
            title="🟠 Skill Gap Analysis"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--orange"
          >
            <MarkdownRenderer content={suggestion.skillGaps} />
          </Card>
        )}

        {suggestion.careerPaths && (
          <Card
            title="🔴 Career Pathways & Missing Skills"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--red"
          >
            <MarkdownRenderer content={suggestion.careerPaths} />
          </Card>
        )}
      </div>
    );
  };

  const renderMatchSuggestions = () => {
    return (
      <div className="hireiq-suggestion-panel__grid">
        {suggestion.honestReview && (
          <Card
            title="🧐 Honest Review & Recommendation"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--purple"
          >
            <MarkdownRenderer content={suggestion.honestReview} />
          </Card>
        )}

        {suggestion.interviewTips && (
          <Card
            title="🟢 Core Strengths & Interview Prep"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--green"
          >
            <MarkdownRenderer content={suggestion.interviewTips} />
          </Card>
        )}

        {suggestion.tailoringSuggestions && (
          <Card
            title="🟠 Job Tailoring Improvements"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--orange"
          >
            <MarkdownRenderer content={suggestion.tailoringSuggestions} />
          </Card>
        )}

        {suggestion.upskillingRoadmap && (
          <Card
            title="🔴 Missing Skills & Upskilling Roadmap"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--red"
          >
            <MarkdownRenderer content={suggestion.upskillingRoadmap} />
          </Card>
        )}
      </div>
    );
  };

  const renderTestSuggestions = () => {
    const studyPlanItems = parseStudyPlan(suggestion.improvementSuggestions);

    return (
      <div className="hireiq-suggestion-panel__grid">
        {suggestion.strengths && (
          <Card
            title="🟢 Core Strengths"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--green"
          >
            <MarkdownRenderer content={suggestion.strengths} />
          </Card>
        )}

        {suggestion.weakTopics && (
          <Card
            title="🟠 Focus Areas & Weaknesses"
            className="hireiq-suggestion-panel__card hireiq-suggestion-panel__card--orange"
          >
            <MarkdownRenderer content={suggestion.weakTopics} />
          </Card>
        )}

        {studyPlanItems.length > 0 && (
          <div className="hireiq-suggestion-panel__study-plan">
            <h3 className="hireiq-suggestion-panel__study-title">📚 Study Plan & Improvement Roadmaps</h3>
            <div className="hireiq-suggestion-panel__study-list">
              {studyPlanItems.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`hireiq-study-card ${
                      isExpanded ? 'hireiq-study-card--expanded' : ''
                    }`}
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className="hireiq-study-card__header">
                      <span className="hireiq-study-card__title">{item.title}</span>
                      <span className="hireiq-study-card__arrow">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="hireiq-study-card__body" onClick={(e) => e.stopPropagation()}>
                        <MarkdownRenderer content={item.content} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`hireiq-suggestion-panel ${className}`} {...props}>
      {type === 'resume' && renderResumeSuggestions()}
      {type === 'match' && renderMatchSuggestions()}
      {type === 'test' && renderTestSuggestions()}
    </div>
  );
};

SuggestionPanel.propTypes = {
  type: PropTypes.oneOf(['resume', 'match', 'test']),
  suggestion: PropTypes.shape({
    resumeFeedback: PropTypes.string,
    skillGaps: PropTypes.string,
    careerPaths: PropTypes.string,
    tailoringSuggestions: PropTypes.string,
    interviewTips: PropTypes.string,
    upskillingRoadmap: PropTypes.string,
    honestReview: PropTypes.string,
    weakTopics: PropTypes.string,
    strengths: PropTypes.string,
    improvementSuggestions: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

export default SuggestionPanel;
