import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useJobs from '../../../hooks/useJobs';
import PageWrapper from '../../../components/layout/PageWrapper/PageWrapper';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import FormGroup from '../../../components/forms/FormGroup/FormGroup';
import './PostJob.css';

export const PostJob = () => {
  const navigate = useNavigate();
  const { create, data: previousJobs } = useJobs({ recruiterOnly: true });

  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    preferredSkills: '',
    location: '',
    experienceRequired: '',
    salaryRange: '',
    status: 'ACTIVE',
    
    // Core Job Details
    employmentType: 'Full Time',
    workMode: 'Onsite',
    openings: 1,
    department: 'Engineering',
    seniority: 'Mid-Level',
    applicationDeadline: '',
    noticePeriodPreference: 'Immediate',
    educationRequirement: 'B.Tech',
    minCgpa: 0.0,
    preferredColleges: '',
    
    // Compensation
    salaryType: 'Fixed',
    currency: 'INR',
    hideSalary: false,
    
    // Location Details
    country: 'India',
    state: '',
    city: '',
    
    // Hiring Flow
    hiringSteps: 'Resume Screening, Technical Interview, HR Interview',
    expectedJoiningDate: '',
    easyApply: true,
    resumeRequired: true,
    portfolioRequired: false,
    
    // AI Weights
    aiWeightSkills: 50,
    aiWeightExperience: 25,
    aiWeightEducation: 15,
    aiWeightProjects: 10,
    
    // Knockout Questions
    knockoutQuestions: '[]',
  });

  const [requiredSkillsList, setRequiredSkillsList] = useState([]);
  const [preferredSkillsList, setPreferredSkillsList] = useState([]);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');

  const [knockoutList, setKnockoutList] = useState([]);
  const [newKnockoutText, setNewKnockoutText] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState('');

  // ── Auto-save to Local Storage ───────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('hireiq_post_job_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
        if (parsed.requiredSkills) {
          setRequiredSkillsList(parsed.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean));
        }
        if (parsed.preferredSkills) {
          setPreferredSkillsList(parsed.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean));
        }
        if (parsed.knockoutQuestions) {
          setKnockoutList(JSON.parse(parsed.knockoutQuestions));
        }
      } catch (e) {
        console.error('Failed to parse auto-saved draft', e);
      }
    }
  }, []);

  const triggerAutoSave = useCallback((updatedForm) => {
    localStorage.setItem('hireiq_post_job_draft', JSON.stringify(updatedForm));
    const now = new Date();
    setLastAutoSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  const handleInputChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    triggerAutoSave(updated);

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
  };

  // ── Sync skills list to form state ────────────────────────────────────────
  useEffect(() => {
    const skillsStr = requiredSkillsList.join(', ');
    setForm((prev) => {
      const updated = { ...prev, requiredSkills: skillsStr };
      localStorage.setItem('hireiq_post_job_draft', JSON.stringify(updated));
      return updated;
    });
  }, [requiredSkillsList]);

  useEffect(() => {
    const skillsStr = preferredSkillsList.join(', ');
    setForm((prev) => {
      const updated = { ...prev, preferredSkills: skillsStr };
      localStorage.setItem('hireiq_post_job_draft', JSON.stringify(updated));
      return updated;
    });
  }, [preferredSkillsList]);

  useEffect(() => {
    const questionsStr = JSON.stringify(knockoutList);
    setForm((prev) => {
      const updated = { ...prev, knockoutQuestions: questionsStr };
      localStorage.setItem('hireiq_post_job_draft', JSON.stringify(updated));
      return updated;
    });
  }, [knockoutList]);

  // ── Skills Add / Remove Handlers ──────────────────────────────────────────
  const handleAddReqSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = reqSkillInput.trim();
      if (val && !requiredSkillsList.includes(val)) {
        setRequiredSkillsList((prev) => [...prev, val]);
        setReqSkillInput('');
      }
    }
  };

  const handleRemoveReqSkill = (skill) => {
    setRequiredSkillsList((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddPrefSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = prefSkillInput.trim();
      if (val && !preferredSkillsList.includes(val)) {
        setPreferredSkillsList((prev) => [...prev, val]);
        setPrefSkillInput('');
      }
    }
  };

  const handleRemovePrefSkill = (skill) => {
    setPreferredSkillsList((prev) => prev.filter((s) => s !== skill));
  };

  // ── Knockout Questions Handlers ───────────────────────────────────────────
  const handleAddKnockout = (e) => {
    e.preventDefault();
    const val = newKnockoutText.trim();
    if (val) {
      setKnockoutList((prev) => [...prev, { text: val, expectedAnswer: 'Yes' }]);
      setNewKnockoutText('');
    }
  };

  const handleRemoveKnockout = (index) => {
    setKnockoutList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKnockoutAnswerChange = (index, ans) => {
    setKnockoutList((prev) =>
      prev.map((q, i) => (i === index ? { ...q, expectedAnswer: ans } : q))
    );
  };

  // ── Duplicate Job Handler ────────────────────────────────────────
  const handleDuplicateJob = (e) => {
    const jobId = e.target.value;
    if (!jobId) return;

    const selected = previousJobs.find((j) => String(j.id) === String(jobId));
    if (selected) {
      const duplicated = {
        ...form,
        title: `${selected.title} (Copy)`,
        description: selected.description || '',
        requiredSkills: selected.requiredSkills || '',
        preferredSkills: selected.preferredSkills || '',
        location: selected.location || '',
        experienceRequired: selected.experienceRequired || '',
        salaryRange: selected.salaryRange || '',
        employmentType: selected.employmentType || 'Full Time',
        workMode: selected.workMode || 'Onsite',
        openings: selected.openings || 1,
        department: selected.department || 'Engineering',
        seniority: selected.seniority || 'Mid-Level',
        applicationDeadline: selected.applicationDeadline || '',
        noticePeriodPreference: selected.noticePeriodPreference || 'Immediate',
        educationRequirement: selected.educationRequirement || 'B.Tech',
        minCgpa: selected.minCgpa || 0.0,
        preferredColleges: selected.preferredColleges || '',
        salaryType: selected.salaryType || 'Fixed',
        currency: selected.currency || 'INR',
        hideSalary: !!selected.hideSalary,
        country: selected.country || 'India',
        state: selected.state || '',
        city: selected.city || '',
        hiringSteps: selected.hiringSteps || 'Resume Screening, Technical Interview, HR Interview',
        expectedJoiningDate: selected.expectedJoiningDate || '',
        easyApply: selected.easyApply !== false,
        resumeRequired: selected.resumeRequired !== false,
        portfolioRequired: !!selected.portfolioRequired,
        aiWeightSkills: selected.aiWeightSkills || 50,
        aiWeightExperience: selected.aiWeightExperience || 25,
        aiWeightEducation: selected.aiWeightEducation || 15,
        aiWeightProjects: selected.aiWeightProjects || 10,
        knockoutQuestions: selected.knockoutQuestions || '[]',
      };

      setForm(duplicated);
      setRequiredSkillsList(selected.requiredSkills ? selected.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : []);
      setPreferredSkillsList(selected.preferredSkills ? selected.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean) : []);
      setKnockoutList(selected.knockoutQuestions ? JSON.parse(selected.knockoutQuestions) : []);
      triggerAutoSave(duplicated);
    }
  };

  // ── Hiring Steps Checkboxes ───────────────────────────────────────────────
  const allHiringSteps = ['Resume Screening', 'Coding Round', 'Technical Interview', 'HR Interview', 'Managerial Round'];
  const handleHiringStepToggle = (step) => {
    const stepsArray = form.hiringSteps.split(',').map((s) => s.trim()).filter(Boolean);
    let newSteps;
    if (stepsArray.includes(step)) {
      newSteps = stepsArray.filter((s) => s !== step);
    } else {
      newSteps = [...stepsArray, step];
    }
    handleInputChange('hiringSteps', newSteps.join(', '));
  };

  // ── Validation logic per step ─────────────────────────────────────────────
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!form.title.trim()) errs.title = 'Job Title is required';
      if (!form.description.trim()) errs.description = 'Job Description is required';
      if (!form.department) errs.department = 'Job Department is required';
      if (!form.seniority) errs.seniority = 'Role Category / Seniority is required';
    } else if (step === 2) {
      if (requiredSkillsList.length === 0) {
        errs.requiredSkills = 'At least one Required Skill tag is required';
      }
      if (!form.city.trim()) errs.city = 'City is required';
    } else if (step === 3) {
      if (!form.salaryRange.trim()) errs.salaryRange = 'Salary Range is required';
    } else if (step === 4) {
      const total = form.aiWeightSkills + form.aiWeightExperience + form.aiWeightEducation + form.aiWeightProjects;
      if (total !== 100) {
        errs.weights = `AI Matching weights must sum to exactly 100% (Current total: ${total}%)`;
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  // ── Submit / Save ─────────────────────────────────────────────────────────
  const handlePost = async (publishStatus = 'ACTIVE') => {
    if (!validateStep(4)) return;

    setSaving(true);
    setSubmitError('');

    // Format location combining country, state, city
    const locationCombined = `${form.city}, ${form.state ? form.state + ', ' : ''}${form.country}`;

    // Format experience e.g. "2-4 years"
    const expStr = form.experienceRequired ? form.experienceRequired : 'Not Specified';

    const payload = {
      ...form,
      location: locationCombined,
      experienceRequired: expStr,
      status: publishStatus,
    };

    try {
      await create(payload);
      localStorage.removeItem('hireiq_post_job_draft');
      navigate('/recruiter/jobs');
    } catch (err) {
      setSubmitError(err.message || 'Failed to post job.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Create a New Job Posting"
      subtitle="Complete the steps to launch your role with advanced AI matching features"
      maxWidth="900px"
      className="hireiq-post-job"
    >
      {submitError && <Alert variant="error">{submitError}</Alert>}

      {/* Recruiter helper top bar */}
      <div className="hireiq-post-job__header-actions">
        <div className="hireiq-post-job__duplicate-select">
          <label htmlFor="duplicate-dropdown">📋 Duplicate from Previous Job:</label>
          <select id="duplicate-dropdown" onChange={handleDuplicateJob} className="hireiq-form-control">
            <option value="">-- Select Job to Duplicate --</option>
            {previousJobs &&
              previousJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.location})
                </option>
              ))}
          </select>
        </div>
        {lastAutoSaved && (
          <span className="hireiq-post-job__autosave-badge">
            ⚡ Draft Auto-saved at {lastAutoSaved}
          </span>
        )}
      </div>

      {/* Multi-step progress tracker */}
      <div className="hireiq-post-job__wizard-indicator">
        {[
          { num: 1, label: 'Core details' },
          { num: 2, label: 'Skills & Location' },
          { num: 3, label: 'Compensation & Hiring' },
          { num: 4, label: 'AI Match & Review' },
        ].map((step) => {
          const isActive = activeStep === step.num;
          const isCompleted = activeStep > step.num;
          return (
            <div
              key={step.num}
              className={`wizard-indicator-step ${isActive ? 'wizard-indicator-step--active' : ''} ${
                isCompleted ? 'wizard-indicator-step--completed' : ''
              }`}
              onClick={() => {
                // Allow jumping to steps already visited or validated
                if (step.num < activeStep || validateStep(activeStep)) {
                  setActiveStep(step.num);
                }
              }}
            >
              <div className="wizard-indicator-step__circle">{isCompleted ? '✓' : step.num}</div>
              <div className="wizard-indicator-step__label">{step.label}</div>
            </div>
          );
        })}
      </div>

      <Card className="hireiq-post-job__card">
        <form onSubmit={(e) => e.preventDefault()} className="hireiq-post-job__form">
          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 1: CORE DETAILS                                       */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeStep === 1 && (
            <div className="post-job-step-content animate-slide-in">
              <h3 className="post-job-step-title">1. Core Job Details</h3>
              <div className="post-job-step-grid">
                <FormGroup label="Job Title *" error={fieldErrors.title} required>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Java Engineer"
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="hireiq-form-control"
                    required
                  />
                </FormGroup>

                <div className="post-job-step-grid__row-2col">
                  <FormGroup label="Job Department *" error={fieldErrors.department} required>
                    <select
                      value={form.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="hireiq-form-control"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Design">Design</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Seniority Level *" error={fieldErrors.seniority} required>
                    <select
                      value={form.seniority}
                      onChange={(e) => handleInputChange('seniority', e.target.value)}
                      className="hireiq-form-control"
                    >
                      <option value="Intern">Intern</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </FormGroup>
                </div>

                <div className="post-job-step-grid__row-3col">
                  <FormGroup label="Employment Type">
                    <select
                      value={form.employmentType}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      className="hireiq-form-control"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Number of Openings">
                    <input
                      type="number"
                      min="1"
                      value={form.openings}
                      onChange={(e) => handleInputChange('openings', Math.max(1, Number(e.target.value)))}
                      className="hireiq-form-control"
                    />
                  </FormGroup>

                  <FormGroup label="Experience Required (e.g. 2-5 years)">
                    <input
                      type="text"
                      placeholder="e.g. 3-5 years"
                      value={form.experienceRequired}
                      onChange={(e) => handleInputChange('experienceRequired', e.target.value)}
                      className="hireiq-form-control"
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Job Description *" error={fieldErrors.description} required>
                  <textarea
                    rows={7}
                    placeholder="Provide detailed job description, responsibilities, daily routines..."
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="hireiq-form-control"
                    required
                  />
                </FormGroup>

                <div className="post-job-step-grid__row-3col">
                  <FormGroup label="Education Requirement">
                    <select
                      value={form.educationRequirement}
                      onChange={(e) => handleInputChange('educationRequirement', e.target.value)}
                      className="hireiq-form-control"
                    >
                      <option value="B.Tech">B.Tech / B.E.</option>
                      <option value="MCA">MCA</option>
                      <option value="MBA">MBA</option>
                      <option value="Any Degree">Any Graduate Degree</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Min CGPA / Percentage">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="e.g. 7.5 or 75"
                      value={form.minCgpa || ''}
                      onChange={(e) => handleInputChange('minCgpa', Number(e.target.value))}
                      className="hireiq-form-control"
                    />
                  </FormGroup>

                  <FormGroup label="Preferred Colleges (optional)">
                    <input
                      type="text"
                      placeholder="e.g. IITs, NITs, BITS"
                      value={form.preferredColleges}
                      onChange={(e) => handleInputChange('preferredColleges', e.target.value)}
                      className="hireiq-form-control"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 2: SKILLS & LOCATION                                  */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeStep === 2 && (
            <div className="post-job-step-content animate-slide-in">
              <h3 className="post-job-step-title">2. Skills &amp; Location</h3>

              {/* Skills Area */}
              <div className="post-job-skills-section">
                <FormGroup
                  label="Required Skills * (Candidates MUST have these to matching)"
                  error={fieldErrors.requiredSkills}
                  required
                >
                  <div className="hireiq-skill-chip-input-container">
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter..."
                      value={reqSkillInput}
                      onChange={(e) => setReqSkillInput(e.target.value)}
                      onKeyDown={handleAddReqSkill}
                      className="hireiq-form-control skill-chip-input"
                    />
                    <Button variant="accent" size="sm" type="button" onClick={handleAddReqSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="hireiq-skill-chips-wrap">
                    {requiredSkillsList.map((skill, index) => (
                      <span key={index} className="hireiq-skill-chip required-chip">
                        {skill}
                        <button type="button" onClick={() => handleRemoveReqSkill(skill)} className="chip-close">
                          ✕
                        </button>
                      </span>
                    ))}
                    {requiredSkillsList.length === 0 && (
                      <span className="no-tags-placeholder">No required skills added.</span>
                    )}
                  </div>
                </FormGroup>

                <FormGroup label="Preferred Skills (Plus points)">
                  <div className="hireiq-skill-chip-input-container">
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter..."
                      value={prefSkillInput}
                      onChange={(e) => setPrefSkillInput(e.target.value)}
                      onKeyDown={handleAddPrefSkill}
                      className="hireiq-form-control skill-chip-input"
                    />
                    <Button variant="accent" size="sm" type="button" onClick={handleAddPrefSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="hireiq-skill-chips-wrap">
                    {preferredSkillsList.map((skill, index) => (
                      <span key={index} className="hireiq-skill-chip preferred-chip">
                        {skill}
                        <button type="button" onClick={() => handleRemovePrefSkill(skill)} className="chip-close">
                          ✕
                        </button>
                      </span>
                    ))}
                    {preferredSkillsList.length === 0 && (
                      <span className="no-tags-placeholder">No preferred skills added.</span>
                    )}
                  </div>
                </FormGroup>
              </div>

              {/* Location Area */}
              <div className="post-job-location-section">
                <div className="post-job-step-grid__row-2col">
                  <FormGroup label="Work Mode">
                    <select
                      value={form.workMode}
                      onChange={(e) => handleInputChange('workMode', e.target.value)}
                      className="hireiq-form-control"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Country">
                    <input
                      type="text"
                      placeholder="e.g. India"
                      value={form.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="hireiq-form-control"
                    />
                  </FormGroup>
                </div>

                <div className="post-job-step-grid__row-2col">
                  <FormGroup label="State / Province">
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={form.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="hireiq-form-control"
                    />
                  </FormGroup>

                  <FormGroup label="City *" error={fieldErrors.city} required>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={form.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="hireiq-form-control"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 3: COMPENSATION & HIRING                              */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeStep === 3 && (
            <div className="post-job-step-content animate-slide-in">
              <h3 className="post-job-step-title">3. Compensation &amp; Hiring</h3>

              {/* Compensation details */}
              <div className="post-job-step-grid__row-3col">
                <FormGroup label="Salary Type">
                  <select
                    value={form.salaryType}
                    onChange={(e) => handleInputChange('salaryType', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Fixed + Bonus">Fixed + Bonus</option>
                    <option value="Stipend">Stipend</option>
                  </select>
                </FormGroup>

                <FormGroup label="Currency">
                  <select
                    value={form.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </FormGroup>

                <FormGroup label="Salary Range *" error={fieldErrors.salaryRange} required>
                  <input
                    type="text"
                    placeholder="e.g. 8 - 12 LPA or $60,000 - $80,000"
                    value={form.salaryRange}
                    onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                    className="hireiq-form-control"
                  />
                </FormGroup>
              </div>

              <div className="post-job-toggle-box">
                <label className="toggle-label-checkbox">
                  <input
                    type="checkbox"
                    checked={form.hideSalary}
                    onChange={(e) => handleInputChange('hideSalary', e.target.checked)}
                    className="hireiq-checkbox-toggle-input"
                  />
                  <span>🚫 Hide Salary Range from candidates</span>
                </label>
              </div>

              <hr className="post-job-divider" />

              {/* Hiring steps details */}
              <div className="post-job-step-grid__row-2col">
                <FormGroup label="Expected Joining Date">
                  <input
                    type="date"
                    value={form.expectedJoiningDate}
                    onChange={(e) => handleInputChange('expectedJoiningDate', e.target.value)}
                    className="hireiq-form-control"
                  />
                </FormGroup>

                <FormGroup label="Application Deadline">
                  <input
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                    className="hireiq-form-control"
                  />
                </FormGroup>
              </div>

              <div className="post-job-step-grid__row-2col">
                <FormGroup label="Notice Period Preference">
                  <select
                    value={form.noticePeriodPreference}
                    onChange={(e) => handleInputChange('noticePeriodPreference', e.target.value)}
                    className="hireiq-form-control"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60+ Days">60+ Days</option>
                  </select>
                </FormGroup>

                <FormGroup label="Hiring Steps Selection">
                  <div className="hiring-steps-checkboxes-container">
                    {allHiringSteps.map((step) => {
                      const isChecked = form.hiringSteps.split(',').map((s) => s.trim()).filter(Boolean).includes(step);
                      return (
                        <label key={step} className="toggle-label-checkbox inline-checkbox">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleHiringStepToggle(step)}
                          />
                          <span>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormGroup>
              </div>

              <hr className="post-job-divider" />

              {/* Easy apply configuration */}
              <div className="post-job-requirements-toggles">
                <h4 className="post-job-section-subtitle">Application Settings</h4>
                <div className="toggles-flex-grid">
                  <label className="toggle-label-checkbox">
                    <input
                      type="checkbox"
                      checked={form.easyApply}
                      onChange={(e) => handleInputChange('easyApply', e.target.checked)}
                    />
                    <span>⚡ Allow Easy Apply (apply with one click)</span>
                  </label>

                  <label className="toggle-label-checkbox">
                    <input
                      type="checkbox"
                      checked={form.resumeRequired}
                      onChange={(e) => handleInputChange('resumeRequired', e.target.checked)}
                    />
                    <span>📄 Resume Submission Required</span>
                  </label>

                  <label className="toggle-label-checkbox">
                    <input
                      type="checkbox"
                      checked={form.portfolioRequired}
                      onChange={(e) => handleInputChange('portfolioRequired', e.target.checked)}
                    />
                    <span>🐙 GitHub / Portfolio Link Required</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 4: AI MATCHING & REVIEW                               */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeStep === 4 && (
            <div className="post-job-step-content animate-slide-in">
              <h3 className="post-job-step-title">4. AI Matching Priority &amp; Knockout Questions</h3>

              {/* Slider priorities */}
              <div className="ai-matching-priority-wrap">
                <h4 className="post-job-section-subtitle">Configure AI Candidate Fit Weights (Sum must equal 100%)</h4>
                {fieldErrors.weights && <Alert variant="error">{fieldErrors.weights}</Alert>}
                
                <div className="priority-slider-row">
                  <div className="slider-header-label">
                    <span>Skills Matching:</span>
                    <strong>{form.aiWeightSkills}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.aiWeightSkills}
                    onChange={(e) => handleInputChange('aiWeightSkills', Number(e.target.value))}
                    className="hireiq-range-slider"
                  />
                </div>

                <div className="priority-slider-row">
                  <div className="slider-header-label">
                    <span>Experience Match:</span>
                    <strong>{form.aiWeightExperience}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.aiWeightExperience}
                    onChange={(e) => handleInputChange('aiWeightExperience', Number(e.target.value))}
                    className="hireiq-range-slider"
                  />
                </div>

                <div className="priority-slider-row">
                  <div className="slider-header-label">
                    <span>Education Relevance:</span>
                    <strong>{form.aiWeightEducation}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.aiWeightEducation}
                    onChange={(e) => handleInputChange('aiWeightEducation', Number(e.target.value))}
                    className="hireiq-range-slider"
                  />
                </div>

                <div className="priority-slider-row">
                  <div className="slider-header-label">
                    <span>Projects &amp; Portfolios:</span>
                    <strong>{form.aiWeightProjects}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.aiWeightProjects}
                    onChange={(e) => handleInputChange('aiWeightProjects', Number(e.target.value))}
                    className="hireiq-range-slider"
                  />
                </div>

                <div className="weights-sum-indicator">
                  Total Weights Sum:{' '}
                  <strong
                    style={{
                      color:
                        form.aiWeightSkills +
                          form.aiWeightExperience +
                          form.aiWeightEducation +
                          form.aiWeightProjects ===
                        100
                          ? 'var(--success)'
                          : 'var(--danger)',
                    }}
                  >
                    {form.aiWeightSkills +
                      form.aiWeightExperience +
                      form.aiWeightEducation +
                      form.aiWeightProjects}
                    %
                  </strong>
                </div>
              </div>

              <hr className="post-job-divider" />

              {/* Knockout Questions */}
              <div className="post-job-knockout-section">
                <h4 className="post-job-section-subtitle">Auto-Reject Knockout Questions</h4>
                <p className="post-job-section-desc">
                  Candidates who answer differently than the expected choice will be automatically disqualified.
                </p>

                <div className="add-knockout-controls-row">
                  <input
                    type="text"
                    placeholder="e.g. Are you willing to relocate to Bangalore?"
                    value={newKnockoutText}
                    onChange={(e) => setNewKnockoutText(e.target.value)}
                    className="hireiq-form-control"
                  />
                  <Button variant="accent" onClick={handleAddKnockout}>
                    + Add Question
                  </Button>
                </div>

                <div className="knockout-questions-list">
                  {knockoutList.map((q, idx) => (
                    <div key={idx} className="knockout-item-card">
                      <span className="knockout-item-text">{q.text}</span>
                      <div className="knockout-item-expected-controls">
                        <label>Expected Answer:</label>
                        <select
                          value={q.expectedAnswer}
                          onChange={(e) => handleKnockoutAnswerChange(idx, e.target.value)}
                          className="hireiq-form-control select-xs"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        <button type="button" onClick={() => handleRemoveKnockout(idx)} className="btn-icon-delete">
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {knockoutList.length === 0 && (
                    <p className="no-knockout-text">No knockout questions added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions bar */}
          <div className="hireiq-post-job__actions">
            {activeStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="hireiq-post-job__btn">
                ← Back
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="hireiq-post-job__btn"
            >
              👁️ Preview Job
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handlePost('DRAFT')}
              disabled={saving}
              className="hireiq-post-job__btn"
            >
              💾 Save Draft
            </Button>

            {activeStep < 4 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="hireiq-post-job__btn">
                Next Step →
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => handlePost('ACTIVE')}
                loading={saving}
                className="hireiq-post-job__btn hireiq-post-job__btn--submit"
              >
                🚀 Publish Job
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* ── LIVE PREVIEW MODAL ──────────────────────────────────────────────── */}
      {showPreview && (
        <div className="preview-job-modal-backdrop">
          <div className="preview-job-modal-content">
            <div className="preview-job-modal-header">
              <h3>👁️ Live Recruiter Preview</h3>
              <button type="button" onClick={() => setShowPreview(false)} className="preview-close-btn">
                ✕
              </button>
            </div>
            
            <div className="preview-job-body">
              <div className="preview-job-title-row">
                <h2>{form.title || 'Untitled Job Position'}</h2>
                <span className="preview-badge-status">Status: {form.status}</span>
              </div>

              <div className="preview-job-meta-grid">
                <div><strong>🏢 Department:</strong> {form.department}</div>
                <div><strong>🎓 Seniority:</strong> {form.seniority}</div>
                <div><strong>💼 Job Type:</strong> {form.employmentType} ({form.workMode})</div>
                <div><strong>📍 Location:</strong> {form.city || 'Bangalore'}, {form.state || 'Karnataka'}, {form.country || 'India'}</div>
                <div><strong>⏱ Experience:</strong> {form.experienceRequired || 'Not Specified'}</div>
                <div><strong>👥 Openings:</strong> {form.openings}</div>
              </div>

              <hr className="preview-divider" />

              <div className="preview-section">
                <h4>Required Skills</h4>
                <div className="preview-chips-row">
                  {requiredSkillsList.map((skill, idx) => (
                    <span key={idx} className="preview-chip required-preview">{skill}</span>
                  ))}
                  {requiredSkillsList.length === 0 && <span>No required skills specified.</span>}
                </div>
              </div>

              <div className="preview-section" style={{ marginTop: '1rem' }}>
                <h4>Preferred Skills</h4>
                <div className="preview-chips-row">
                  {preferredSkillsList.map((skill, idx) => (
                    <span key={idx} className="preview-chip preferred-preview">{skill}</span>
                  ))}
                  {preferredSkillsList.length === 0 && <span>No preferred skills specified.</span>}
                </div>
              </div>

              <hr className="preview-divider" />

              <div className="preview-section">
                <h4>Job Description</h4>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {form.description || 'No description provided.'}
                </p>
              </div>

              <hr className="preview-divider" />

              <div className="preview-section">
                <h4>Compensation &amp; Joining Details</h4>
                <div className="preview-meta-grid">
                  <div>
                    <strong>💰 Salary Range:</strong>{' '}
                    {form.hideSalary ? 'Confidential' : `${form.salaryRange} (${form.currency} - ${form.salaryType})`}
                  </div>
                  <div><strong>Notice Period:</strong> {form.noticePeriodPreference}</div>
                  {form.expectedJoiningDate && <div><strong>Joining Date:</strong> {form.expectedJoiningDate}</div>}
                  {form.applicationDeadline && <div><strong>Apply Before:</strong> {form.applicationDeadline}</div>}
                </div>
              </div>

              <hr className="preview-divider" />

              <div className="preview-section">
                <h4>Hiring Stages</h4>
                <div className="preview-hiring-stages">
                  {form.hiringSteps.split(',').map((s) => s.trim()).filter(Boolean).map((step, idx) => (
                    <div key={idx} className="preview-stage-badge">
                      <span className="stage-num">{idx + 1}</span> {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="preview-modal-footer">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default PostJob;
