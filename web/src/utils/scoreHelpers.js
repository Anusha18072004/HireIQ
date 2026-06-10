export const getScoreColor = (score) => {
  if (score == null) return 'var(--text3)';
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

export const getScoreLabel = (score) => {
  if (score == null) return 'N/A';
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Average Match';
  return 'Low Match';
};
