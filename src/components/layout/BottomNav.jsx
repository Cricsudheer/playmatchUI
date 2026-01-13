import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Users, Calendar, User } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const BottomNav = () => {
  const navItems = [
    { path: ROUTES.APP.HOME, icon: Home, label: 'Home' },
    { path: ROUTES.APP.STATS, icon: BarChart3, label: 'Stats' },
    { path: ROUTES.APP.TEAMS, icon: Users, label: 'Teams' },
    { path: ROUTES.APP.EVENTS, icon: Calendar, label: 'Events' },
    { path: ROUTES.APP.PROFILE, icon: User, label: 'Profile' }
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
