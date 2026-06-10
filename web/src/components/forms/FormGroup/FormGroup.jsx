import React from 'react';
import PropTypes from 'prop-types';
import './FormGroup.css';

export const FormGroup = ({
  label,
  error,
  required = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`hireiq-form-group ${className}`} {...props}>
      {label && (
        <label className="hireiq-form-group__label">
          {label} {required && <span className="hireiq-form-group__required">*</span>}
        </label>
      )}
      <div className="hireiq-form-group__field">
        {children}
      </div>
      {error && <span className="hireiq-form-group__error-msg">{error}</span>}
    </div>
  );
};

FormGroup.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default FormGroup;
