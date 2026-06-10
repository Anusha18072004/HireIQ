import React from 'react';
import PropTypes from 'prop-types';
import './PageWrapper.css';

export const PageWrapper = ({
  children,
  title,
  subtitle,
  action,
  maxWidth = '1100px',
  className = '',
  ...props
}) => {
  return (
    <div className={`hireiq-page-wrapper ${className}`} {...props}>
      <div className="container" style={{ maxWidth }}>
        {(title || subtitle || action) && (
          <div className="hireiq-page-wrapper__header">
            <div className="hireiq-page-wrapper__title-block">
              {title && <h1 className="hireiq-page-wrapper__title">{title}</h1>}
              {subtitle && <p className="hireiq-page-wrapper__subtitle">{subtitle}</p>}
            </div>
            {action && <div className="hireiq-page-wrapper__action">{action}</div>}
          </div>
        )}
        <main className="hireiq-page-wrapper__content">
          {children}
        </main>
      </div>
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
};

export default PageWrapper;
