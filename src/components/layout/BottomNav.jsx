import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav = () => {
  const navItems = [
    { path: '/app/home', icon: '🏏', label: 'Home' },
    { path: '/app/stats', icon: '📊', label: 'Stats' },
    { path: '/app/teams', icon: '🎪', label: 'Teams' },
    { path: '/app/events', icon: '🏆', label: 'Events' },
    { path: '/app/profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <nav className="app-bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `app-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="app-nav-icon">{item.icon}</span>
          <span className="app-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
