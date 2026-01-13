import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppShell = () => {
  return (
    <div className="app-shell">
      <Header />

      <main className="app-content">
        <div className="app-content-container">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
