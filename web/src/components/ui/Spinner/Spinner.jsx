import React from 'react';
import PropTypes from 'prop-types';
import './Spinner.css';

export const Spinner = ({
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClass = 'hireiq-spinner';
  const sizeClass = `${baseClass}--${size}`;
  const variantClass = `${baseClass}--${variant}`;

  const classNames = [
    baseClass,
    sizeClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  return <div className={classNames} {...props} />;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'white', 'accent']),
  className: PropTypes.string,
};

export default Spinner;
