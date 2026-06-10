import React, { useState } from 'react';
import Card from '../../../../components/ui/Card/Card';
import Button from '../../../../components/ui/Button/Button';
import { addLanguage, deleteLanguage } from '../../../../api/profile.api';

export const LanguagesCard = ({ languages = [], onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ languageName: '', proficiency: 'Professional' });
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.languageName.trim()) {
      setError('Language name is required');
      return;
    }
    try {
      await addLanguage(form);
      setForm({ languageName: '', proficiency: 'Professional' });
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to add language');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this language?')) {
      await deleteLanguage(id);
      onRefresh();
    }
  };

  return (
    <Card
      title="🗣️ Languages"
      action={
        !isAdding && (
          <Button variant="accent" size="sm" onClick={() => setIsAdding(true)}>
            + Add Language
          </Button>
        )
      }
      className="hireiq-profile-page__section-card"
    >
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="hireiq-profile-page__inline-form hireiq-language-form"
        >
          {error && <div className="hireiq-language-form__error">{error}</div>}
          <div className="hireiq-language-form__grid">
            <div className="hireiq-language-form__group">
              <label className="hireiq-language-form__label">Language Name</label>
              <input
                type="text"
                placeholder="e.g. English, French, Hindi"
                value={form.languageName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, languageName: e.target.value }))
                }
                className="hireiq-form-control"
              />
            </div>
            <div className="hireiq-language-form__group">
              <label className="hireiq-language-form__label">Proficiency</label>
              <select
                value={form.proficiency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, proficiency: e.target.value }))
                }
                className="hireiq-form-control"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Professional">Professional</option>
                <option value="Proficient">Proficient</option>
                <option value="Native / Bilingual">Native / Bilingual</option>
              </select>
            </div>
          </div>
          <div className="hireiq-language-form__actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit">
              Add
            </Button>
          </div>
        </form>
      )}

      {languages.length === 0 ? (
        <div className="hireiq-profile-page__empty-state">
          <span className="hireiq-profile-page__empty-icon">🗣️</span>
          <p className="hireiq-profile-page__empty-text">No languages added yet.</p>
        </div>
      ) : (
        <div className="hireiq-language-chips">
          {languages.map((lang) => (
            <span key={lang.id} className="hireiq-language-chip">
              <span className="hireiq-language-chip__name">{lang.languageName}</span>
              <span className="hireiq-language-chip__prof">{lang.proficiency}</span>
              {lang.isAiExtracted && (
                <span className="ai-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  AI
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(lang.id)}
                className="hireiq-language-chip__delete"
                aria-label={`Remove ${lang.languageName}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LanguagesCard;
