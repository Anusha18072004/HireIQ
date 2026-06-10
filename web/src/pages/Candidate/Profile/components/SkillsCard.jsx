import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import './SkillsCard.css';

export const SkillsCard = ({ skills = '', onSave }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('technical');

  const skillList = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const toolsKeywords = [
    'git', 'github', 'docker', 'jira', 'slack', 'vs code', 'figma',
    'trello', 'postman', 'aws', 'kubernetes', 'jenkins', 'maven',
    'npm', 'yarn', 'eclipse', 'intellij', 'webpack', 'babel',
  ];

  const softKeywords = [
    'communication', 'leadership', 'teamwork', 'problem solving',
    'time management', 'agile', 'scrum', 'adaptability', 'creativity',
    'critical thinking', 'conflict resolution', 'negotiation',
  ];

  const getSkillCategory = (skill) => {
    const lower = skill.toLowerCase();
    if (toolsKeywords.some((tk) => lower.includes(tk))) return 'tools';
    if (softKeywords.some((sk) => lower.includes(sk))) return 'soft';
    return 'technical';
  };

  const filteredSkills = skillList.filter((s) => getSkillCategory(s) === activeTab);

  const handleAddSkill = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (newSkill && !skillList.includes(newSkill)) {
        const updated = [...skillList, newSkill].join(',');
        await onSave(updated);
        setInputValue('');
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skillList.filter((s) => s !== skillToRemove).join(',');
    await onSave(updated);
  };

  return (
    <Card title="⚡ Key Skills" className="hireiq-profile-page__section-card">
      <div className="hireiq-skills-card">
        {/* Tab Header */}
        <div className="hireiq-skills-card__tabs">
          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`hireiq-skills-card__tab-btn ${activeTab === 'technical' ? 'hireiq-skills-card__tab-btn--active' : ''
              }`}
          >
            💻 Technical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`hireiq-skills-card__tab-btn ${activeTab === 'tools' ? 'hireiq-skills-card__tab-btn--active' : ''
              }`}
          >
            🛠️ Tools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('soft')}
            className={`hireiq-skills-card__tab-btn ${activeTab === 'soft' ? 'hireiq-skills-card__tab-btn--active' : ''
              }`}
          >
            💬 Soft Skills
          </button>
        </div>

        {/* Skill Chips List */}
        <div className="hireiq-skills-card__list">
          {filteredSkills.length === 0 ? (
            <p className="hireiq-skills-card__empty">
              No skills added to this category yet.
            </p>
          ) : (
            filteredSkills.map((skill, index) => (
              <span key={index} className="hireiq-skills-card__chip">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hireiq-skills-card__chip-remove"
                  aria-label={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Skill Input */}
        <div className="hireiq-skills-card__input-wrap" style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder={`Add a skill to ${activeTab} (press Enter to save)...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddSkill}
            className="hireiq-form-control hireiq-skills-card__input"
          />
        </div>
      </div>
    </Card>
  );
};

export default SkillsCard;
