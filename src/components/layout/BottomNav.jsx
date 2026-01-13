import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Users, Calendar, User } from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { path: '/app/home', icon: Home, label: 'Home' },
    { path: '/app/stats', icon: BarChart3, label: 'Stats' },
    { path: '/app/teams', icon: Users, label: 'Teams' },
    { path: '/app/events', icon: Calendar, label: 'Events' },
    { path: '/app/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="app-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `app-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="app-nav-icon" size={24} strokeWidth={2} />
            <span className="app-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
