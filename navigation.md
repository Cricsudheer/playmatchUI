# Navigation System Implementation Guide
## Bottom Navigation Bar + Contextual Header

**Document Type**: Technical Implementation Specification
**Target Audience**: Frontend Developers
**Status**: Ready for Development
**Estimated Effort**: 2 Sprints (4 weeks)
**Last Updated**: January 11, 2026

---

## Table of Contents
1. [Overview & Objectives](#overview--objectives)
2. [Prerequisites](#prerequisites)
3. [Backend Requirements](#backend-requirements)
4. [Design Specifications](#design-specifications)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Implementation Steps](#implementation-steps)
8. [Corner Cases & Edge Scenarios](#corner-cases--edge-scenarios)
9. [Testing Checklist](#testing-checklist)
10. [Accessibility Requirements](#accessibility-requirements)
11. [Migration Plan](#migration-plan)
12. [Code Examples](#code-examples)

---

## Overview & Objectives

### What We're Building

**Replace**: Current top navigation bar (Navigation.jsx)
**With**:
1. **Bottom Navigation Bar** - 5 fixed tabs for mobile-first navigation
2. **Contextual Header** - Dynamic header showing team context and actions

### Why This Change?

#### Current Problems
- Top navbar takes 64px of precious vertical space on mobile
- Profile/logout buttons hidden in small screens
- No team context switching mechanism
- Desktop-first design doesn't optimize for thumb reach
- No support for multi-team users

#### Solutions
- Bottom nav: Thumb-reachable, always visible, industry standard (WhatsApp, Instagram)
- Saves vertical space on mobile (header becomes contextual, not navigation)
- Team selector prominent in header
- Mobile-first with progressive enhancement for desktop

### Success Criteria

✅ Bottom nav accessible with one thumb tap
✅ Team context visible at all times
✅ Navigation works offline (cached state)
✅ Smooth transitions between tabs (< 300ms)
✅ Works on all devices (320px to 2560px width)
✅ WCAG 2.1 AA compliant
✅ No breaking changes to existing routes

---

## Prerequisites

### Dependencies to Install

```bash
# Icon library (if not already installed)
npm install lucide-react

# Animation library (if not already installed)
npm install framer-motion

# Classname utility (already installed)
# clsx, tailwind-merge
```

### Existing Code to Audit

**Files to Review Before Starting:**
```
src/
├── components/
│   └── Navigation.jsx          # Current nav (will be replaced)
├── App.jsx                     # Routing logic (will be modified)
├── hooks/
│   └── useAuth.jsx             # Auth context (will be extended)
├── utils/
│   └── authUtils.js            # Token management
└── constants/
    └── config.js               # Config constants
```

### Browser Support

**Target Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Critical Features Used:**
- CSS Grid
- Flexbox
- CSS Custom Properties
- Intersection Observer (for header state)
- LocalStorage

---

## Backend Requirements

### APIs Needed

#### 1. Get User's Teams (NEW ENDPOINT REQUIRED)

**Endpoint**: `GET /api/users/me/teams`

**Purpose**: Fetch all teams user belongs to with their roles

**Request**:
```http
GET /api/users/me/teams HTTP/1.1
Host: localhost:8080
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Team Sigma",
      "role": "ADMIN",
      "logoUrl": "https://cdn.playmatch.com/teams/1/logo.png",
      "memberCount": 15,
      "city": "Bengaluru",
      "isActive": true,
      "jerseyNumber": 7,
      "primaryRole": "BATTER"
    },
    {
      "id": 2,
      "name": "Weekend Warriors",
      "role": "PLAYER",
      "logoUrl": null,
      "memberCount": 22,
      "city": "Mumbai",
      "isActive": true,
      "jerseyNumber": 12,
      "primaryRole": "ALL_ROUNDER"
    }
  ],
  "defaultTeamId": 1
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 404: User has no teams
- 500: Server error

**Notes**:
- Should return teams sorted by: ADMIN first, then COORDINATOR, then PLAYER
- Only returns active teams (isActive=true)
- defaultTeamId is last selected team or first team if never selected

#### 2. Get Unread Notifications Count (NEW ENDPOINT REQUIRED)

**Endpoint**: `GET /api/notifications/unread-count`

**Purpose**: Badge count for notifications bell icon

**Request**:
```http
GET /api/notifications/unread-count HTTP/1.1
Host: localhost:8080
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "count": 5,
  "breakdown": {
    "events": 2,
    "teams": 1,
    "mentions": 2
  }
}
```

**Polling Strategy**: Poll every 30 seconds when app is active

#### 3. Update Last Selected Team (NEW ENDPOINT REQUIRED)

**Endpoint**: `PUT /api/users/me/preferences`

**Purpose**: Save user's last selected team for persistence

**Request**:
```http
PUT /api/users/me/preferences HTTP/1.1
Host: localhost:8080
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "lastSelectedTeamId": 2
}
```

**Response**:
```json
{
  "success": true,
  "preferences": {
    "lastSelectedTeamId": 2,
    "notificationSettings": {},
    "theme": "dark"
  }
}
```

### Backend Changes Summary

**Required New Endpoints**: 3
1. `GET /api/users/me/teams` - Critical
2. `GET /api/notifications/unread-count` - Critical
3. `PUT /api/users/me/preferences` - Nice to have (can use localStorage fallback)

**Existing Endpoints to Use**:
- `GET /api/players/profile/{userId}` - User profile
- `GET /api/events/my-events` - User events
- Auth endpoints - Already implemented

**Database Schema Changes Required**:
- UserPreferences table (if not exists)
  - userId (FK)
  - lastSelectedTeamId (nullable FK to Team)
  - preferences (JSON)
  - updatedAt

---

## Design Specifications

### Color Palette (from ui-ux.md)

```css
/* Primary Colors */
--primary: #1e88e5;           /* Active tab blue */
--primary-dark: #1565c0;      /* Active hover */
--primary-light: #64b5f6;     /* Active background */

/* Accent */
--accent: #fbbf24;            /* Notification badge */

/* Neutrals - Dark Theme */
--bg: #050816;                /* Page background */
--bg-elevated: #0f172a;       /* Bottom nav background */
--surface-2: #1e293b;         /* Header background */
--surface-3: #334155;         /* Hover states */

--text-primary: #e5e7eb;      /* Active text */
--text-secondary: #9ca3af;    /* Inactive text */
--border: rgba(148, 163, 184, 0.2);

/* Shadows */
--shadow-top: 0 -2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### Bottom Navigation Specifications

#### Layout & Dimensions

```
Desktop (≥1024px):
┌────────────────────────────────────────┐
│         CONTENT (with max-width)       │
│                                        │
└────────────────────────────────────────┘
Note: Bottom nav HIDDEN on desktop, use sidebar or top nav

Tablet (768px - 1023px):
┌────────────────────────────────────────┐
│              CONTENT                   │
├────────────────────────────────────────┤
│ [Home] [Stats] [Teams] [Events] [Prof] │ ← 64px height
└────────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────┐
│      CONTENT         │
├──────────────────────┤
│ 🏏  📊  🎪  🏆  👤 │ ← 64px height
│ Home Stat Team Evnt │
└──────────────────────┘
```

**Exact Measurements:**
```css
.bottom-nav {
  height: 64px;                    /* Fixed height */
  position: fixed;                 /* Always visible */
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 300;                    /* Above content, below modals */
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  box-shadow: var(--shadow-top);
  backdrop-filter: blur(8px);      /* iOS Safari effect */
}

.bottom-nav-container {
  max-width: 640px;                /* Center on tablets */
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-around;   /* Equal spacing */
  align-items: center;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  min-width: 64px;                 /* Touch target */
  min-height: 48px;                /* Touch target */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;              /* For badge positioning */
}

.nav-item-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2px;
}

.nav-item-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Active state */
.nav-item.active {
  background: rgba(30, 136, 229, 0.1);  /* primary with alpha */
}

.nav-item.active .nav-item-icon {
  color: var(--primary);
  stroke-width: 2.5px;             /* Bolder when active */
  transform: scale(1.05);
}

.nav-item.active .nav-item-label {
  color: var(--primary);
}

/* Inactive state */
.nav-item:not(.active) .nav-item-icon {
  color: var(--text-secondary);
}

.nav-item:not(.active) .nav-item-label {
  color: var(--text-secondary);
}

/* Hover state (desktop) */
@media (hover: hover) {
  .nav-item:not(.active):hover {
    background: rgba(148, 163, 184, 0.1);
  }

  .nav-item:not(.active):hover .nav-item-icon,
  .nav-item:not(.active):hover .nav-item-label {
    color: var(--text-primary);
  }
}

/* Notification Badge */
.nav-item-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--accent);
  color: #050816;                  /* Dark text on gold */
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-elevated);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Hide on desktop (optional - depends on design decision) */
@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}
```

#### Tab Configuration

**5 Tabs** (in order):

| Tab | Icon (Lucide) | Label | Route | Badge |
|-----|---------------|-------|-------|-------|
| Home | `Home` | Home | `/` | None |
| Stats | `BarChart3` | Stats | `/stats` | None |
| Teams | `Users` | Teams | `/teams` | Team invites count |
| Events | `Calendar` | Events | `/events` | Pending RSVPs count |
| Profile | `User` | Profile | `/profile` | None |

**Icon States:**
```jsx
import {
  Home,
  BarChart3,
  Users,
  Calendar,
  User
} from 'lucide-react';

// Active: filled version or bolder stroke
// Inactive: regular stroke
```

### Header Specifications

#### Layout Variants

**Variant 1: Team Context Header (Home, Stats, Teams, Events)**

```
┌──────────────────────────────────────────┐
│ [Team Sigma ▼]         🔔(3)  ⚙️        │ ← 56px height
└──────────────────────────────────────────┘
```

**Variant 2: Simple Header (Profile)**

```
┌──────────────────────────────────────────┐
│ Profile                        [Edit]    │ ← 56px height
└──────────────────────────────────────────┘
```

**Variant 3: Page-Specific Header (with back button)**

```
┌──────────────────────────────────────────┐
│ ← Team Management                  ⚙️    │ ← 56px height
└──────────────────────────────────────────┘
```

#### Dimensions & Styling

```css
.app-header {
  height: 56px;                    /* Fixed height */
  position: sticky;                /* Sticky on scroll */
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;                    /* Below modals, above content */
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

/* Team Selector Button */
.team-selector-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 200px;                /* Prevent overflow */
}

.team-selector-button:hover {
  background: rgba(148, 163, 184, 0.15);
  border-color: var(--primary);
}

.team-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--surface-3);    /* Fallback color */
}

.team-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.team-role-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.team-selector-button[aria-expanded="true"] .chevron-icon {
  transform: rotate(180deg);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}

.header-icon-button:hover {
  background: rgba(148, 163, 184, 0.1);
}

.header-icon {
  width: 22px;
  height: 22px;
  color: var(--text-primary);
}

/* Notification Badge on Bell Icon */
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--accent);
  color: #050816;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface-2);
}

/* Responsive */
@media (max-width: 640px) {
  .team-name {
    max-width: 100px;
  }

  .team-role-badge {
    display: none;           /* Hide role badge on small screens */
  }
}
```

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── navigation/
│   │   ├── BottomNav.jsx                # Main bottom nav component
│   │   ├── BottomNavItem.jsx            # Individual nav item
│   │   ├── Header.jsx                   # Main header component
│   │   ├── TeamSelector.jsx             # Team dropdown component
│   │   ├── TeamSelectorDropdown.jsx     # Dropdown menu
│   │   └── NotificationBadge.jsx        # Badge component
│   ├── layout/
│   │   └── AppLayout.jsx                # Layout wrapper (Header + Content + BottomNav)
│   └── Navigation.jsx                   # OLD - will be deprecated
├── hooks/
│   ├── useTeamContext.jsx               # NEW - Team context hook
│   ├── useNotifications.jsx             # NEW - Notifications hook
│   └── useAuth.jsx                      # EXTEND - Add team data
├── contexts/
│   └── TeamContext.jsx                  # NEW - Team state management
├── services/
│   ├── teamService.js                   # NEW - Team API calls
│   └── notificationService.js           # NEW - Notification API
└── constants/
    └── navigation.js                    # NEW - Nav configuration
```

### Component Hierarchy

```
App
└── AuthProvider
    └── TeamProvider (NEW)
        └── Router
            └── AppLayout (NEW)
                ├── Header
                │   ├── TeamSelector
                │   │   └── TeamSelectorDropdown
                │   └── HeaderActions
                │       └── NotificationBadge
                ├── <Page Content>
                └── BottomNav
                    └── BottomNavItem (×5)
```

### Data Flow

```
User Action (tap nav item)
    ↓
BottomNavItem onClick
    ↓
useNavigate('/route')
    ↓
Router changes route
    ↓
AppLayout renders new page
    ↓
Header updates context (if needed)
```

```
User selects team
    ↓
TeamSelector onClick
    ↓
setCurrentTeam(teamId)
    ↓
TeamContext updates
    ↓
All consuming components re-render
    ↓
Services fetch team-specific data
```

---

## State Management

### Option 1: React Context API (Recommended for MVP)

**Why Context?**
- Simple, no external dependencies
- Built into React
- Sufficient for nav state
- Easy to upgrade to Zustand/Redux later

**TeamContext Structure:**

```javascript
// src/contexts/TeamContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserTeams } from '../services/teamService';

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // State
  const [teams, setTeams] = useState([]);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived state
  const currentTeam = teams.find(t => t.id === currentTeamId) || null;
  const currentRole = currentTeam?.role || null;
  const hasMultipleTeams = teams.length > 1;

  // Load teams on auth
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setTeams([]);
      setCurrentTeamId(null);
      setLoading(false);
      return;
    }

    loadUserTeams();
  }, [isAuthenticated, user]);

  async function loadUserTeams() {
    try {
      setLoading(true);
      const response = await getUserTeams();
      setTeams(response.teams);

      // Set initial team (from localStorage or API default)
      const savedTeamId = localStorage.getItem('lastSelectedTeamId');
      const initialTeamId = savedTeamId || response.defaultTeamId || response.teams[0]?.id;

      setCurrentTeamId(initialTeamId);
      setError(null);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Switch team
  function switchTeam(teamId) {
    setCurrentTeamId(teamId);
    localStorage.setItem('lastSelectedTeamId', teamId);

    // Optional: Persist to backend
    // updateUserPreferences({ lastSelectedTeamId: teamId });
  }

  // Refresh teams (after creating new team)
  async function refreshTeams() {
    await loadUserTeams();
  }

  const value = {
    teams,
    currentTeam,
    currentTeamId,
    currentRole,
    hasMultipleTeams,
    loading,
    error,
    switchTeam,
    refreshTeams,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider');
  }
  return context;
}
```

### Option 2: Zustand (Alternative if complexity grows)

```javascript
// src/stores/teamStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useTeamStore = create(
  persist(
    (set, get) => ({
      teams: [],
      currentTeamId: null,

      setTeams: (teams) => set({ teams }),

      switchTeam: (teamId) => {
        set({ currentTeamId: teamId });
        // Optional API call
      },

      getCurrentTeam: () => {
        const { teams, currentTeamId } = get();
        return teams.find(t => t.id === currentTeamId);
      },
    }),
    {
      name: 'team-storage',
      partialState: (state) => ({ currentTeamId: state.currentTeamId }),
    }
  )
);
```

**Decision**: Use Context API for MVP, migrate to Zustand if state becomes complex.

### Navigation State

**Route-Based State** (no separate nav state needed):

```javascript
// Current route determines active tab
// useLocation() from react-router-dom

function getActiveTab(pathname) {
  if (pathname === '/' || pathname === '/home') return 'home';
  if (pathname.startsWith('/stats')) return 'stats';
  if (pathname.startsWith('/teams')) return 'teams';
  if (pathname.startsWith('/events')) return 'events';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home'; // fallback
}
```

### Notification State

```javascript
// src/hooks/useNotifications.jsx
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notificationService';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [breakdown, setBreakdown] = useState({});

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
      setBreakdown(data.breakdown);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }

  function markAsRead() {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return { unreadCount, breakdown, markAsRead, refresh: fetchUnreadCount };
}
```

---

## Implementation Steps

### Phase 1: Setup & Infrastructure (Week 1, Days 1-2)

#### Step 1.1: Install Dependencies

```bash
# Verify/install required packages
npm install lucide-react framer-motion
npm install clsx tailwind-merge # Should already be installed

# Verify React Router v6
npm list react-router-dom
```

#### Step 1.2: Create Service Files

**File**: `src/services/teamService.js`

```javascript
import { API_CONFIG } from '../constants/config';
import { fetchWithAuth } from './authService';

export async function getUserTeams() {
  const url = `${API_CONFIG.AUTH_BASE_URL}/api/users/me/teams`;

  try {
    const response = await fetchWithAuth(url, { method: 'GET' });

    if (!response.ok) {
      if (response.status === 404) {
        return { teams: [], defaultTeamId: null };
      }
      throw new Error('Failed to fetch teams');
    }

    return await response.json();
  } catch (error) {
    console.error('[teamService] Error fetching teams:', error);
    throw error;
  }
}

export async function updateUserPreferences(preferences) {
  const url = `${API_CONFIG.AUTH_BASE_URL}/api/users/me/preferences`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    return await response.json();
  } catch (error) {
    console.error('[teamService] Error updating preferences:', error);
    // Don't throw - fallback to localStorage
    return null;
  }
}
```

**File**: `src/services/notificationService.js`

```javascript
import { API_CONFIG } from '../constants/config';
import { fetchWithAuth } from './authService';

export async function getUnreadCount() {
  const url = `${API_CONFIG.AUTH_BASE_URL}/api/notifications/unread-count`;

  try {
    const response = await fetchWithAuth(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch notification count');
    }

    return await response.json();
  } catch (error) {
    console.error('[notificationService] Error fetching count:', error);
    // Return default instead of throwing
    return { count: 0, breakdown: {} };
  }
}
```

#### Step 1.3: Create Constants

**File**: `src/constants/navigation.js`

```javascript
import {
  Home,
  BarChart3,
  Users,
  Calendar,
  User,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    showBadge: false,
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: BarChart3,
    path: '/stats',
    showBadge: false,
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: Users,
    path: '/teams',
    showBadge: true,
    badgeKey: 'teams', // maps to notification breakdown
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    path: '/events',
    showBadge: true,
    badgeKey: 'events',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    showBadge: false,
  },
];

export const NAV_HEIGHT = 64; // px
export const HEADER_HEIGHT = 56; // px
```

### Phase 2: Core Components (Week 1, Days 3-5)

#### Step 2.1: Create TeamContext

**File**: `src/contexts/TeamContext.jsx`

```javascript
// See "State Management" section above for full code
```

#### Step 2.2: Create BottomNav Components

**File**: `src/components/navigation/BottomNavItem.jsx`

```javascript
import { cn } from '@/lib/utils';

export function BottomNavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  badge = null
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'gap-1 px-3 py-2 min-w-[64px] min-h-[48px]',
        'rounded-lg transition-all duration-200',
        'relative', // for badge positioning
        isActive && 'bg-primary/10',
        !isActive && 'hover:bg-slate-700/10'
      )}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'w-6 h-6 transition-all duration-200',
          isActive ? 'text-primary stroke-[2.5px] scale-105' : 'text-slate-400 stroke-2'
        )}
      />
      <span
        className={cn(
          'text-[11px] font-medium tracking-wide',
          isActive ? 'text-primary' : 'text-slate-400'
        )}
      >
        {label}
      </span>

      {badge > 0 && (
        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1
                       bg-amber-400 text-slate-900 rounded-full
                       text-[11px] font-bold flex items-center justify-center
                       border-2 border-slate-800 shadow-md">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
```

**File**: `src/components/navigation/BottomNav.jsx`

```javascript
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavItem } from './BottomNavItem';
import { NAV_ITEMS } from '@/constants/navigation';
import { useNotifications } from '@/hooks/useNotifications';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { breakdown } = useNotifications();

  function getActiveTab(pathname) {
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname.startsWith('/stats')) return 'stats';
    if (pathname.startsWith('/teams')) return 'teams';
    if (pathname.startsWith('/events')) return 'events';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
  }

  const activeTab = getActiveTab(location.pathname);

  function handleNavClick(item) {
    navigate(item.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[300] h-16
                 bg-slate-800/95 border-t border-slate-700/20
                 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]
                 backdrop-blur-md
                 lg:hidden" // Hide on desktop (≥1024px)
      aria-label="Main navigation"
    >
      <div className="max-w-2xl mx-auto h-full flex justify-around items-center px-2">
        {NAV_ITEMS.map((item) => {
          const badge = item.showBadge && breakdown[item.badgeKey]
            ? breakdown[item.badgeKey]
            : null;

          return (
            <BottomNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => handleNavClick(item)}
              badge={badge}
            />
          );
        })}
      </div>
    </nav>
  );
}
```

#### Step 2.3: Create Header Components

**File**: `src/components/navigation/TeamSelector.jsx`

```javascript
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTeamContext } from '@/contexts/TeamContext';
import { TeamSelectorDropdown } from './TeamSelectorDropdown';
import { cn } from '@/lib/utils';

export function TeamSelector() {
  const { currentTeam, teams, loading } = useTeamContext();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-slate-600" />
        <div className="w-24 h-4 bg-slate-600 rounded" />
      </div>
    );
  }

  if (!currentTeam || teams.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30">
        <span className="text-sm text-slate-400">No teams</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-slate-700/30 border border-slate-600/30',
          'hover:bg-slate-700/50 hover:border-primary/50',
          'transition-all duration-200',
          'max-w-[200px]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentTeam.logoUrl ? (
          <img
            src={currentTeam.logoUrl}
            alt={currentTeam.name}
            className="w-7 h-7 rounded-full object-cover bg-slate-600"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
            {currentTeam.name.charAt(0)}
          </div>
        )}

        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-semibold text-slate-100 truncate max-w-[120px]">
            {currentTeam.name}
          </span>
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider hidden sm:block">
            {currentTeam.role}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <TeamSelectorDropdown
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
```

**File**: `src/components/navigation/TeamSelectorDropdown.jsx`

```javascript
import { useTeamContext } from '@/contexts/TeamContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function getRoleIcon(role) {
  if (role === 'ADMIN') return Crown;
  if (role === 'COORDINATOR') return Star;
  return UsersIcon;
}

export function TeamSelectorDropdown({ onClose }) {
  const { teams, currentTeamId, switchTeam } = useTeamContext();
  const navigate = useNavigate();

  function handleTeamClick(teamId) {
    switchTeam(teamId);
    onClose();
  }

  function handleFindTeams() {
    navigate('/teams');
    onClose();
  }

  return (
    <div
      className="absolute top-full left-0 mt-2 w-64
                 bg-slate-800 border border-slate-700/50 rounded-lg
                 shadow-xl z-[400]
                 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-2">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          My Teams
        </div>

        <div className="space-y-1">
          {teams.map((team) => {
            const Icon = getRoleIcon(team.role);
            const isActive = team.id === currentTeamId;

            return (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-slate-700/50 border border-transparent'
                )}
              >
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold">
                    {team.name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      'w-3.5 h-3.5',
                      team.role === 'ADMIN' && 'text-amber-400',
                      team.role === 'COORDINATOR' && 'text-blue-400',
                      team.role === 'PLAYER' && 'text-slate-400'
                    )} />
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {team.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{team.role}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{team.memberCount} members</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-700/50 p-2">
        <button
          onClick={handleFindTeams}
          className="w-full px-3 py-2 text-sm font-medium text-primary hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          Find More Teams →
        </button>
      </div>
    </div>
  );
}
```

**File**: `src/components/navigation/Header.jsx`

```javascript
import { Bell, Settings } from 'lucide-react';
import { TeamSelector } from './TeamSelector';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header({
  showTeamSelector = true,
  title = null,
  actions = null
}) {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 right-0 z-[200] h-14
                      bg-slate-800/95 border-b border-slate-700/20
                      shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showTeamSelector ? (
            <TeamSelector />
          ) : title ? (
            <h1 className="text-lg font-semibold text-slate-100">
              {title}
            </h1>
          ) : null}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {actions || (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="relative w-10 h-10 flex items-center justify-center
                         rounded-full hover:bg-slate-700/50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-100" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-[16px] h-[16px] px-1
                                 bg-amber-400 text-slate-900 rounded-full
                                 text-[10px] font-bold flex items-center justify-center
                                 border-2 border-slate-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 flex items-center justify-center
                         rounded-full hover:bg-slate-700/50 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-slate-100" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Phase 3: Layout Integration (Week 2, Days 1-2)

#### Step 3.1: Create AppLayout Component

**File**: `src/components/layout/AppLayout.jsx`

```javascript
import { Header } from '../navigation/Header';
import { BottomNav } from '../navigation/BottomNav';
import { useLocation } from 'react-router-dom';

const ROUTES_WITHOUT_TEAM_SELECTOR = ['/profile', '/settings', '/notifications'];

export function AppLayout({ children }) {
  const location = useLocation();

  const showTeamSelector = !ROUTES_WITHOUT_TEAM_SELECTOR.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header showTeamSelector={showTeamSelector} />

      <main className="flex-1 pb-20 lg:pb-4">
        {/* pb-20 (80px) on mobile for bottom nav clearance */}
        {/* pb-4 on desktop (no bottom nav) */}
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
```

#### Step 3.2: Update App.jsx

**File**: `src/App.jsx`

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { AwardsPage } from './pages/AwardsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth.jsx';
import { TeamProvider } from './contexts/TeamContext.jsx'; // NEW
import { AppLayout } from './components/layout/AppLayout'; // NEW
import { Toaster } from 'sonner';
import './styles/main.css';

function AppContent() {
  return (
    <Routes>
      {/* Public Routes - No Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes - With Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div>Stats Page (TODO)</div>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div>Teams Page (TODO)</div>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div>Events Page (TODO)</div>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/awards"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AwardsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PlayerProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider> {/* NEW - Wraps Router */}
        <Router>
          <Toaster position="top-right" richColors />
          <AppContent />
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}
```

#### Step 3.3: Create useNotifications Hook

**File**: `src/hooks/useNotifications.jsx`

```javascript
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notificationService';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
      setBreakdown(data.breakdown || {});
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Set to 0 on error
      setUnreadCount(0);
      setBreakdown({});
    } finally {
      setLoading(false);
    }
  }

  function markAsRead() {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return {
    unreadCount,
    breakdown,
    loading,
    markAsRead,
    refresh: fetchUnreadCount
  };
}
```

### Phase 4: Testing & Refinement (Week 2, Days 3-5)

**See Testing Checklist section below**

---

## Corner Cases & Edge Scenarios

### 1. User Has No Teams

**Scenario**: New user completes profile but hasn't created/joined any teams

**Behavior**:
- TeamSelector shows "No teams" message
- Header displays app logo instead of team selector
- Home page shows "Create your first team" CTA
- Teams tab shows "Find Teams" as primary action
- Stats/Events tabs show empty state

**Implementation**:
```javascript
// In TeamContext
if (teams.length === 0) {
  return <EmptyTeamsState />;
}

// In Header
{teams.length > 0 ? <TeamSelector /> : <AppLogo />}
```

### 2. User Has Only One Team

**Scenario**: User is member of exactly one team

**Behavior**:
- TeamSelector still shows (for consistency)
- Dropdown shows single team + "Find More Teams" option
- No performance impact (no need to fetch repeatedly)

**Implementation**:
```javascript
const hasMultipleTeams = teams.length > 1;

// Still render dropdown, but maybe auto-close after viewing
```

### 3. Team Data Loading States

**Scenario**: Teams are being fetched from backend

**Behavior**:
- Show skeleton/loading state in TeamSelector
- Bottom nav remains functional (doesn't depend on team data)
- Don't block navigation while loading

**Implementation**:
```javascript
if (loading) {
  return <TeamSelectorSkeleton />;
}
```

### 4. Network Offline / API Failure

**Scenario**: User is offline or API returns error

**Behavior**:
- Use cached team data from localStorage
- Show stale-data indicator
- Retry on reconnection
- Don't crash navigation

**Implementation**:
```javascript
try {
  const teams = await getUserTeams();
  setTeams(teams);
  localStorage.setItem('cachedTeams', JSON.stringify(teams));
} catch (err) {
  // Fallback to cache
  const cached = localStorage.getItem('cachedTeams');
  if (cached) {
    setTeams(JSON.parse(cached));
    showToast('Using offline data');
  }
}
```

### 5. Notifications API Fails

**Scenario**: Notification count endpoint returns error

**Behavior**:
- Don't show badge (default to 0)
- Log error silently
- Continue polling (retry on next interval)
- Don't block navigation

**Implementation**:
```javascript
try {
  const data = await getUnreadCount();
  setUnreadCount(data.count);
} catch (err) {
  console.error('Notifications failed:', err);
  setUnreadCount(0); // Fail gracefully
}
```

### 6. Deep Links / Direct URL Access

**Scenario**: User navigates directly to `/events` via URL

**Behavior**:
- Bottom nav highlights correct tab
- Team context loads before page renders
- ProtectedRoute handles auth check

**Implementation**:
```javascript
// getActiveTab function handles all routes
const activeTab = getActiveTab(location.pathname);
```

### 7. Browser Back/Forward Navigation

**Scenario**: User uses browser back button

**Behavior**:
- Bottom nav updates to reflect current route
- No unnecessary API calls
- Smooth transition

**Implementation**:
```javascript
// React Router handles this automatically
// Just ensure getActiveTab is pure function
```

### 8. Long Team Names Overflow

**Scenario**: Team name is "Maharashtra State Cricket Association"

**Behavior**:
- Text truncates with ellipsis
- Full name visible on hover (title attribute)
- Dropdown shows full name

**Implementation**:
```javascript
<span
  className="truncate max-w-[120px]"
  title={currentTeam.name}
>
  {currentTeam.name}
</span>
```

### 9. Very High Notification Count

**Scenario**: User has 150+ unread notifications

**Behavior**:
- Badge shows "99+"
- Full count visible in notifications page
- Badge doesn't break layout

**Implementation**:
```javascript
{badge > 99 ? '99+' : badge}
```

### 10. Role Changes While App Open

**Scenario**: Admin demotes user from ADMIN to PLAYER in another tab

**Behavior**:
- Poll teams API periodically (e.g., every 5 minutes)
- Update role in real-time
- Show toast: "Your role in Team X was updated"
- Refresh permissions

**Implementation**:
```javascript
// In TeamContext
useEffect(() => {
  const interval = setInterval(refreshTeams, 300000); // 5 min
  return () => clearInterval(interval);
}, []);
```

### 11. Team Deletion While User Viewing It

**Scenario**: Admin deletes team while user is viewing team page

**Behavior**:
- Detect team no longer in list
- Redirect to Teams page
- Show toast: "Team X was deleted"
- Switch to another team automatically

**Implementation**:
```javascript
useEffect(() => {
  if (currentTeamId && !teams.find(t => t.id === currentTeamId)) {
    // Team was deleted
    const nextTeam = teams[0];
    if (nextTeam) {
      switchTeam(nextTeam.id);
    }
    navigate('/teams');
    toast.error('Selected team is no longer available');
  }
}, [teams, currentTeamId]);
```

### 12. Session Expiry During Navigation

**Scenario**: JWT expires while user is navigating

**Behavior**:
- fetchWithAuth handles 401
- Attempts refresh token
- If refresh fails, redirect to login
- Save intended destination

**Implementation**:
```javascript
// In authService.js (existing)
if (response.status === 401) {
  try {
    await refreshToken();
    // Retry request
  } catch {
    logout();
    navigate('/login', { state: { from: location.pathname } });
  }
}
```

### 13. Rapid Tab Switching

**Scenario**: User taps bottom nav items rapidly

**Behavior**:
- Debounce navigation
- Show loading state
- Don't queue multiple navigations

**Implementation**:
```javascript
let navigationInProgress = false;

function handleNavClick(item) {
  if (navigationInProgress) return;

  navigationInProgress = true;
  navigate(item.path);

  setTimeout(() => {
    navigationInProgress = false;
  }, 300);
}
```

### 14. Low-End Device Performance

**Scenario**: User on old Android phone with limited RAM

**Behavior**:
- Use CSS transitions (not JavaScript animations)
- Minimize re-renders
- Lazy load heavy components
- No animations if reduced-motion preferred

**Implementation**:
```javascript
// Use framer-motion with reduced motion support
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();
```

### 15. Portrait/Landscape Orientation Change

**Scenario**: User rotates device

**Behavior**:
- Layout adapts automatically
- Bottom nav remains at bottom
- No loss of state

**Implementation**:
```css
/* Responsive classes handle this */
@media (orientation: landscape) and (max-height: 500px) {
  .bottom-nav {
    height: 48px; /* Shorter on landscape */
  }
}
```

---

## Testing Checklist

### Unit Tests

```javascript
// src/components/navigation/__tests__/BottomNav.test.jsx

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BottomNav } from '../BottomNav';
import { TeamProvider } from '@/contexts/TeamContext';

describe('BottomNav', () => {
  it('renders all 5 nav items', () => {
    render(
      <BrowserRouter>
        <TeamProvider>
          <BottomNav />
        </TeamProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Stats')).toBeInTheDocument();
    expect(screen.getByLabelText('Teams')).toBeInTheDocument();
    expect(screen.getByLabelText('Events')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile')).toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    // Mock useLocation to return /stats
    // Assert Stats tab has active class
  });

  it('navigates on tab click', () => {
    // Mock navigate
    // Click Stats tab
    // Assert navigate was called with '/stats'
  });

  it('shows notification badge when count > 0', () => {
    // Mock useNotifications to return count: 5
    // Assert badge is visible with text "5"
  });
});
```

### Integration Tests

**Test Suite**: Navigation Flow
```javascript
describe('Navigation Flow', () => {
  it('navigates between all tabs', async () => {
    // Start at Home
    // Click Stats → Assert at /stats
    // Click Teams → Assert at /teams
    // Click Events → Assert at /events
    // Click Profile → Assert at /profile
    // Click Home → Assert back at /
  });

  it('maintains team context across navigation', async () => {
    // Switch to Team B
    // Navigate to Stats
    // Assert Team B is still selected
    // Navigate to Events
    // Assert Team B is still selected
  });
});
```

### E2E Tests (Playwright/Cypress)

```javascript
// cypress/e2e/navigation.cy.js

describe('Bottom Navigation', () => {
  beforeEach(() => {
    cy.login(); // Custom command
    cy.visit('/');
  });

  it('shows bottom nav on mobile', () => {
    cy.viewport(375, 667); // iPhone SE
    cy.get('[aria-label="Main navigation"]').should('be.visible');
  });

  it('hides bottom nav on desktop', () => {
    cy.viewport(1920, 1080);
    cy.get('[aria-label="Main navigation"]').should('not.be.visible');
  });

  it('switches teams from header', () => {
    cy.get('[aria-expanded]').click(); // Team selector
    cy.contains('Weekend Warriors').click();
    cy.contains('Weekend Warriors').should('be.visible');
  });

  it('shows notification count', () => {
    cy.intercept('GET', '/api/notifications/unread-count', {
      count: 7,
      breakdown: { events: 5, teams: 2 }
    });
    cy.get('[aria-label="Events"]').find('.badge').should('contain', '5');
  });
});
```

### Manual Testing Checklist

**Device Testing:**
- [ ] iPhone SE (375x667) - Smallest supported
- [ ] iPhone 14 Pro Max (428x926) - Large phone
- [ ] iPad (768x1024) - Tablet
- [ ] Desktop 1920x1080 - Full desktop

**Browser Testing:**
- [ ] Chrome 120+ (Desktop & Mobile)
- [ ] Safari 17+ (iOS & macOS)
- [ ] Firefox 120+
- [ ] Edge 120+

**Functionality:**
- [ ] All tabs navigate correctly
- [ ] Active tab highlights properly
- [ ] Team selector dropdown opens/closes
- [ ] Switching teams updates context
- [ ] Notification badges display correctly
- [ ] Badges update when count changes
- [ ] Long team names truncate
- [ ] Works offline with cached data
- [ ] Works when backend is down
- [ ] Deep links work (/events, /teams)
- [ ] Browser back button works
- [ ] Keyboard navigation works (Tab key)
- [ ] Screen reader announces correctly

**Performance:**
- [ ] Navigation transition < 300ms
- [ ] No layout shift on load
- [ ] No jank when scrolling
- [ ] Polling doesn't cause performance issues
- [ ] Works smoothly on low-end devices

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Navigation Landmarks
```jsx
<nav aria-label="Main navigation">
  {/* Bottom nav items */}
</nav>

<header aria-label="Page header">
  {/* Team selector, notifications */}
</header>
```

#### Keyboard Navigation
```javascript
// Bottom nav items
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  aria-label={label}
  aria-current={isActive ? 'page' : undefined}
>
```

#### Focus Management
```css
/* Visible focus indicators */
.nav-item:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.header-icon-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

#### Screen Reader Support
```jsx
// Notification badge
<span className="sr-only">
  {unreadCount} unread notifications
</span>
<span aria-hidden="true">{unreadCount}</span>

// Team selector
<button
  aria-expanded={isOpen}
  aria-haspopup="true"
  aria-label={`Current team: ${currentTeam.name}, Role: ${currentTeam.role}`}
>
```

#### Color Contrast
```
Text on Background:
- Active text (#1e88e5) on dark (#050816) = 7.2:1 ✅
- Inactive text (#9ca3af) on dark (#050816) = 5.8:1 ✅
- Badge text (#050816) on gold (#fbbf24) = 10.1:1 ✅

All ratios exceed WCAG AA requirement of 4.5:1
```

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .team-selector-button,
  .chevron-icon {
    transition: none !important;
    animation: none !important;
  }
}
```

---

## Migration Plan

### Step 1: Feature Flag (Week 1)

**Add Feature Toggle:**

```javascript
// src/constants/features.js
export const FEATURES = {
  NEW_NAVIGATION: import.meta.env.VITE_NEW_NAV === 'true',
};

// In App.jsx
import { FEATURES } from './constants/features';

{FEATURES.NEW_NAVIGATION ? (
  <AppLayout>
    <DashboardPage />
  </AppLayout>
) : (
  <>
    <Navigation {...oldProps} />
    <DashboardPage />
  </>
)}
```

**Enable for Testing:**
```bash
# .env.local
VITE_NEW_NAV=true
```

### Step 2: Parallel Run (Week 2)

- Deploy to staging with new nav enabled
- QA team tests thoroughly
- Fix bugs, collect feedback
- Performance testing

### Step 3: Gradual Rollout (Week 3)

**Option A: All Users at Once**
```bash
# Production .env
VITE_NEW_NAV=true
```

**Option B: Canary Release**
```javascript
// Enable for 10% of users based on user ID
const isInCanary = user.id % 10 === 0;
const useNewNav = FEATURES.NEW_NAVIGATION || isInCanary;
```

### Step 4: Cleanup (Week 4)

- Remove feature flag
- Delete old Navigation.jsx
- Remove legacy nav styles
- Update documentation

---

## Code Examples

### Complete BottomNav Component

```jsx
// src/components/navigation/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { breakdown } = useNotifications();

  function getActiveTab(pathname) {
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname.startsWith('/stats')) return 'stats';
    if (pathname.startsWith('/teams')) return 'teams';
    if (pathname.startsWith('/events')) return 'events';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
  }

  const activeTab = getActiveTab(location.pathname);

  function handleNavClick(item) {
    if (location.pathname === item.path) return; // Already there

    navigate(item.path);

    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[300] h-16
                 bg-slate-800/95 border-t border-slate-700/20
                 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]
                 backdrop-blur-md
                 lg:hidden"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="max-w-2xl mx-auto h-full flex justify-around items-center px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = item.showBadge && breakdown[item.badgeKey]
            ? breakdown[item.badgeKey]
            : null;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center',
                'gap-1 px-3 py-2 min-w-[64px] min-h-[48px]',
                'rounded-lg transition-all duration-200',
                'relative',
                isActive && 'bg-primary/10',
                !isActive && 'hover:bg-slate-700/10'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-200',
                  isActive
                    ? 'text-primary stroke-[2.5px] scale-105'
                    : 'text-slate-400 stroke-2'
                )}
                aria-hidden="true"
              />

              <span
                className={cn(
                  'text-[11px] font-medium tracking-wide',
                  isActive ? 'text-primary' : 'text-slate-400'
                )}
              >
                {item.label}
              </span>

              {badge > 0 && (
                <>
                  <span className="sr-only">{badge} notifications</span>
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1
                             bg-amber-400 text-slate-900 rounded-full
                             text-[11px] font-bold flex items-center justify-center
                             border-2 border-slate-800 shadow-md"
                    aria-hidden="true"
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

### Complete TeamContext

```jsx
// src/contexts/TeamContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserTeams, updateUserPreferences } from '../services/teamService';
import { toast } from 'sonner';

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [teams, setTeams] = useState([]);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentTeam = teams.find(t => t.id === currentTeamId) || null;
  const currentRole = currentTeam?.role || null;
  const hasMultipleTeams = teams.length > 1;

  // Load teams on auth
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setTeams([]);
      setCurrentTeamId(null);
      setLoading(false);
      return;
    }

    loadUserTeams();

    // Refresh teams every 5 minutes to catch role changes
    const interval = setInterval(loadUserTeams, 300000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadUserTeams = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getUserTeams();
      const fetchedTeams = response.teams || [];

      setTeams(fetchedTeams);

      // Determine initial team
      const savedTeamId = localStorage.getItem('lastSelectedTeamId');
      const parsedTeamId = savedTeamId ? parseInt(savedTeamId, 10) : null;

      let initialTeamId = null;

      // Priority: savedTeamId (if still valid) > defaultTeamId > first team
      if (parsedTeamId && fetchedTeams.find(t => t.id === parsedTeamId)) {
        initialTeamId = parsedTeamId;
      } else if (response.defaultTeamId) {
        initialTeamId = response.defaultTeamId;
      } else if (fetchedTeams.length > 0) {
        initialTeamId = fetchedTeams[0].id;
      }

      setCurrentTeamId(initialTeamId);
      setError(null);

      console.log('[TeamContext] Loaded teams:', fetchedTeams.length);
    } catch (err) {
      console.error('[TeamContext] Failed to load teams:', err);

      // Fallback to cached teams
      const cachedTeams = localStorage.getItem('cachedTeams');
      if (cachedTeams) {
        try {
          const parsed = JSON.parse(cachedTeams);
          setTeams(parsed);
          if (parsed.length > 0) {
            setCurrentTeamId(parsed[0].id);
          }
          toast.warning('Using offline team data');
        } catch {
          // Cache corrupted
          setTeams([]);
        }
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTeam = useCallback((teamId) => {
    console.log('[TeamContext] Switching to team:', teamId);

    setCurrentTeamId(teamId);
    localStorage.setItem('lastSelectedTeamId', teamId.toString());

    // Persist to backend (fire and forget)
    updateUserPreferences({ lastSelectedTeamId: teamId }).catch(err => {
      console.error('[TeamContext] Failed to persist preference:', err);
      // Don't show error to user, localStorage is sufficient
    });
  }, []);

  const refreshTeams = useCallback(async () => {
    await loadUserTeams();
  }, [loadUserTeams]);

  // Cache teams for offline use
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('cachedTeams', JSON.stringify(teams));
    }
  }, [teams]);

  const value = {
    teams,
    currentTeam,
    currentTeamId,
    currentRole,
    hasMultipleTeams,
    loading,
    error,
    switchTeam,
    refreshTeams,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider');
  }
  return context;
}
```

---

## Performance Optimization

### Memoization

```javascript
import { memo } from 'react';

// Memoize BottomNavItem to prevent unnecessary re-renders
export const BottomNavItem = memo(function BottomNavItem({ icon: Icon, label, isActive, onClick, badge }) {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.badge === nextProps.badge
  );
});
```

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

// Lazy load team dropdown (not critical for initial render)
const TeamSelectorDropdown = lazy(() => import('./TeamSelectorDropdown'));

// In TeamSelector
{isOpen && (
  <Suspense fallback={<div>Loading...</div>}>
    <TeamSelectorDropdown onClose={() => setIsOpen(false)} />
  </Suspense>
)}
```

### API Request Deduplication

```javascript
// In teamService.js
let teamsPromise = null;

export async function getUserTeams() {
  // If already fetching, return same promise
  if (teamsPromise) {
    return teamsPromise;
  }

  teamsPromise = fetch(/*...*/).then(/*...*/);

  // Clear after resolution
  teamsPromise.finally(() => {
    teamsPromise = null;
  });

  return teamsPromise;
}
```

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Code review completed
- [ ] Feature flag configured
- [ ] Backend endpoints ready
- [ ] Database migrations run

**Deployment:**
- [ ] Deploy to staging
- [ ] QA approval
- [ ] Deploy to production
- [ ] Enable feature flag for 10% users
- [ ] Monitor error rates
- [ ] Monitor performance metrics

**Post-Deployment:**
- [ ] Verify navigation works
- [ ] Check error logs
- [ ] Monitor analytics
- [ ] Collect user feedback
- [ ] Gradually increase rollout
- [ ] 100% rollout after 1 week

---

## Summary

This document provides everything needed to implement the bottom navigation and header system:

✅ Complete component specifications
✅ Backend API requirements
✅ State management strategy
✅ Step-by-step implementation guide
✅ Corner case handling
✅ Testing checklist
✅ Accessibility compliance
✅ Migration plan
✅ Production-ready code examples

**Estimated Timeline**: 2 sprints (4 weeks)
**Team Size**: 2-3 frontend developers
**Dependencies**: 3 backend endpoints

**Next Steps**:
1. Backend team: Implement 3 required endpoints
2. Frontend team: Follow Phase 1-4 implementation steps
3. QA team: Execute testing checklist
4. Product team: Plan gradual rollout

---

**Document Version**: 1.0
**Last Updated**: January 11, 2026
**Author**: Lead Frontend Engineer
**Status**: Ready for Implementation ✅
