export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return date.toLocaleDateString(undefined, defaultOptions);
};

export const formatLongDate = (dateString) => {
  return formatDate(dateString, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
