import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Sidebar.css';

export const Sidebar = ({ links = [], className = '', ...props }) => {
  if (links.length === 0) return null;

  return (
    <aside className={`hireiq-sidebar ${className}`} {...props}>
      <ul className="hireiq-sidebar__list">
        {links.map((link) => (
          <li key={link.path} className="hireiq-sidebar__item">
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `hireiq-sidebar__link ${
                  isActive ? 'hireiq-sidebar__link--active' : ''
                }`
              }
            >
              {link.icon && <span className="hireiq-sidebar__icon">{link.icon}</span>}
              <span className="hireiq-sidebar__label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

Sidebar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ),
  className: PropTypes.string,
};

export default Sidebar;
