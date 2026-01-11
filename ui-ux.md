# PlayMatch App - UI/UX Design Document
## Version 2.0 - Multi-Team Platform

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Platform Architecture](#platform-architecture)
3. [Current State Analysis](#current-state-analysis)
4. [User Personas & Use Cases](#user-personas--use-cases)
5. [Proposed Design System](#proposed-design-system)
6. [Navigation Architecture](#navigation-architecture)
7. [Multi-Team Management](#multi-team-management)
8. [Page-by-Page Redesign](#page-by-page-redesign)
9. [Component Library](#component-library)
10. [Mobile-First Considerations](#mobile-first-considerations)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Vision
Transform PlayMatch into a multi-team cricket management platform where users can:
- Join and manage multiple teams simultaneously
- Take on different roles (Admin, Coordinator, Player) in different teams
- Organize matches, events, and tournaments across teams
- Track performance individually and across all teams
- Connect with cricket communities in their city

### Key Problems Identified
1. **Desktop-First Navigation**: Current top navbar doesn't optimize for mobile usage
2. **Single-Team Limitation**: No support for users in multiple teams
3. **No Team Discovery**: Can't search and join existing teams
4. **Missing Event Management**: No way to create/manage matches and events
5. **No Role Differentiation**: Same view for admins, coordinators, and players
6. **Information Overload**: Dashboard shows too much data without context
7. **No Team Context Switching**: Users managing multiple teams need quick switching

### Proposed Solution
- **Multi-Team Architecture** with team switching and context management
- **Bottom Navigation Bar** for mobile-first navigation with 5 core sections
- **Team Selector** prominent in header for quick context switching
- **Role-Based Permissions** different capabilities based on team role
- **Unified Events System** replacing separate match management
- **Team Discovery & Join Flow** public teams directory
- **Action-Oriented Design** with FABs and swipe gestures
- **Cross-Team Analytics** aggregate stats across all teams

### Platform Scale
**Target Users**: Players participating in 2-5 teams on average
**Use Cases**:
- Weekend warriors playing for office team + friends team
- Tournament players in multiple competitive teams
- Admins managing academy team + corporate team
- City-level players visible across multiple team contexts

---

## Platform Architecture

### Multi-Team Model

**Core Concept**: One User → Many Teams → Many Roles

```
User (Sudheer)
├── Team: Office Warriors
│   ├── Role: ADMIN
│   ├── Can: Create events, manage members, view stats
│   └── Jersey: #7, Batter
├── Team: Weekend Strikers
│   ├── Role: PLAYER
│   ├── Can: RSVP to events, view team stats
│   └── Jersey: #12, All-rounder
└── Team: City Champions
    ├── Role: COORDINATOR
    ├── Can: Create events, view stats (no member management)
    └── Jersey: #5, Bowler
```

### Role Hierarchy & Permissions

#### ADMIN (Team Creator)
**Capabilities**:
- ✅ Create/update/delete team
- ✅ Add/remove members
- ✅ Change member roles
- ✅ Create events for team
- ✅ Invite participants to events
- ✅ View all team stats
- ✅ Delete team

**UI Indicators**:
- Crown icon next to name
- "Admin" badge on profile
- Access to "Team Settings" in menu

#### COORDINATOR
**Capabilities**:
- ✅ Create events for team
- ✅ Invite participants to events
- ✅ View team stats
- ❌ Cannot manage members
- ❌ Cannot change roles
- ❌ Cannot delete team

**UI Indicators**:
- Star icon next to name
- "Coordinator" badge
- Limited settings access

#### PLAYER (Default)
**Capabilities**:
- ✅ View team details
- ✅ RSVP to events
- ✅ View own stats
- ✅ View team stats
- ❌ Cannot create events
- ❌ Cannot manage team

**UI Indicators**:
- No special badge
- Basic player view

### Team Lifecycle

```
1. Team Creation
   └─> User creates team → Becomes ADMIN automatically
       └─> Can customize: name, city, description, logo

2. Member Addition (3 Methods)
   ├─> By User ID (existing users)
   ├─> By Phone Number (creates pending invitation)
   └─> By Invite Link (future feature)

3. Member Management
   ├─> Add members (ADMIN only)
   ├─> Change roles (ADMIN only)
   └─> Remove members (ADMIN only)

4. Team Deactivation
   └─> Soft delete (isActive=false)
```

### Backend API Structure

**Complete API Endpoints** (from BACKEND_postman_collection.json):

#### Authentication
```
POST /v1/auth/register
POST /v1/auth/login
POST /v1/auth/refresh-token
POST /v1/auth/forgot-password
POST /v1/auth/reset-password
```

#### Player Profile
```
POST   /api/players/profile              (Create profile)
PUT    /api/players/profile              (Update profile)
GET    /api/players/profile/{userId}     (Get by user ID)
GET    /api/players/search               (Search players)
  ?city=Bengaluru&primaryRole=BATTER&limit=10&offset=0
```

#### Team Management
```
POST   /api/teams                        (Create team → user becomes ADMIN)
GET    /api/teams                        (Search teams)
  ?city=Bengaluru&name=Warriors&limit=10&offset=0
GET    /api/teams/{teamId}               (Get team details - public)
PUT    /api/teams/{teamId}               (Update team - ADMIN only)
DELETE /api/teams/{teamId}               (Soft delete - ADMIN only)

GET    /api/teams/{teamId}/members       (List members)
  ?role=PLAYER&limit=20&offset=0
POST   /api/teams/{teamId}/members       (Add members - ADMIN)
  Body: { "playerIds": [1,2], "role": "PLAYER" }
POST   /api/teams/{teamId}/members/by-phone  (Add by phone)
  Body: { "phoneNumbers": ["9876543210"], "role": "PLAYER" }
DELETE /api/teams/{teamId}/members/{userId}  (Remove member - ADMIN)
PUT    /api/teams/{teamId}/members/{userId}/role  (Change role - ADMIN)
  Body: { "role": "COORDINATOR" }
```

#### Events (Matches, Practices, Tournaments)
```
POST   /api/events                       (Create event)
  Body: {
    "title": "Sunday Practice Match",
    "description": "Bring your own kit",
    "eventType": "PRACTICE_MATCH",  // or LEAGUE_MATCH, TOURNAMENT, etc.
    "eventDate": "2026-01-15T09:00:00+05:30",
    "durationMinutes": 180,
    "location": "Cubbon Park Cricket Ground",
    "city": "Bengaluru",
    "visibility": "PUBLIC",  // or PRIVATE, TEAM_ONLY
    "maxParticipants": 22,
    "minParticipants": 11
  }

GET    /api/events                       (Search/discover events)
  ?city=Bengaluru&eventType=PRACTICE_MATCH&limit=10&offset=0
GET    /api/events/{eventId}             (Get event details)
PUT    /api/events/{eventId}             (Update event - creator only)
DELETE /api/events/{eventId}             (Cancel event)
  Body: { "reason": "Weather forecast shows rain" }

POST   /api/events/{eventId}/participants  (Invite participants)
  Body: { "userIds": [1,2,3] }
GET    /api/events/{eventId}/participants  (Get participants)
  ?responseStatus=YES
DELETE /api/events/{eventId}/participants/{userId}  (Remove participant)

POST   /api/events/{eventId}/respond     (RSVP to event)
  Body: {
    "responseStatus": "YES",  // or NO, TENTATIVE
    "comment": "Looking forward!"
  }

GET    /api/events/{eventId}/summary     (Get response summary)
GET    /api/events/my-events             (Get user's events)
  ?filter=created&limit=20&offset=0
  // filter options: created, invited, confirmed, tentative, upcoming
```

### Data Model Context

**User**
- Has one PlayerProfile (1:1)
- Belongs to many Teams (N:M through TeamMembership)
- Has different roles in different teams

**Team**
- Has many members (N:M through TeamMembership)
- Has many events
- Has team-specific stats

**Event**
- Belongs to one creator (User)
- Can be associated with a team (optional)
- Has many participants (N:M through EventParticipant)

**TeamMembership**
- Links User ↔ Team
- Stores role (ADMIN, COORDINATOR, PLAYER)
- Stores team-specific details (jersey number, etc.)

---

## Current State Analysis

### Existing Features
#### Authentication
- ✅ Login/Signup flow
- ✅ Player profile creation (name, gender, mobile, city, role, jersey size)
- ✅ Session management with JWT

#### Stats Dashboard
- ✅ Player statistics (batting, bowling, fielding)
- ✅ Overview tab with impact scoring
- ✅ Sorting and filtering options
- ✅ Min innings filter

#### Awards System
- ✅ Season awards display
- ✅ Nominee information
- ✅ Award filtering by type

### Current API Endpoints (Discovered)
```
Authentication:
- POST /v1/auth/login
- POST /v1/auth/register
- POST /v1/auth/refresh-token

Player Profile:
- GET /api/players/profile/{userId}
- POST /api/players/profile (create)
- PUT /api/players/profile (update)

Stats:
- GET /sigma/api/players/all/stats
```

### UX Pain Points

#### 1. **Navigation Issues**
- Top navbar takes precious vertical space on mobile
- Profile and logout buttons hidden in dropdown on small screens
- No clear visual indication of current page beyond subtle highlighting
- Awards and Dashboard compete for attention equally (no hierarchy)

#### 2. **Mobile Usability**
- Stats tables scroll horizontally (difficult to compare data)
- Small touch targets (< 44px recommended minimum)
- No swipe gestures for common actions
- Text sizes not optimized for mobile reading

#### 3. **Captain Workflow Gaps**
- No way to create/view upcoming matches
- Can't manage team selection
- Missing player availability tracking
- No match result entry interface

#### 4. **Player Experience Gaps**
- Can't mark availability for matches
- No personal performance trends
- Missing notifications for team selection
- Can't see upcoming match schedule

---

## User Personas & Use Cases

### Persona 1: Team Captain - "Rahul"
**Demographics**: 28 years old, plays on weekends, organizes matches via WhatsApp

**Goals**:
- Quickly create matches and share with team
- Track which players are available
- Select best XI based on stats and availability
- Record match results efficiently
- Monitor team performance trends

**Frustrations**:
- Switching between WhatsApp, Excel, and apps to manage team
- Manually tracking who's available
- Forgetting to update stats after matches
- Can't easily see who performed well recently

**Key Use Cases**:
1. Create a new match → Select date/time/venue → Share with team
2. View responses → See who's available/unavailable
3. Select playing XI → Check recent form/stats
4. Post-match → Enter scores quickly
5. Review team performance → Identify top performers

### Persona 2: Regular Player - "Priya"
**Demographics**: 25 years old, plays monthly, busy with work

**Goals**:
- Quickly check upcoming matches
- Mark availability with one tap
- See personal stats and improvement
- Know if selected for upcoming match
- View teammates' performance

**Frustrations**:
- Missing match notifications in WhatsApp groups
- Don't know if team needs her role
- Stats tracking feels disconnected from real matches
- Unclear what jersey number/role to expect

**Key Use Cases**:
1. Open app → See next match → Mark "Available"
2. Check if selected for upcoming match
3. View personal stats after match
4. Compare performance with teammates
5. Update availability status

---

## Proposed Design System

### Color Palette
```css
/* Primary - Cricket Theme */
--primary: #1e88e5;           /* Action Blue */
--primary-dark: #1565c0;
--primary-light: #64b5f6;

/* Secondary - Success/Active */
--secondary: #43a047;         /* Field Green */
--secondary-dark: #2e7d32;
--secondary-light: #66bb6a;

/* Accent - Highlights */
--accent: #fbbf24;            /* Award Gold (existing) */
--accent-danger: #e53935;     /* Out/Unavailable Red */
--accent-warning: #fb8c00;    /* Pending Orange */

/* Neutrals - Dark Theme (existing) */
--bg: #050816;
--bg-elevated: #0f172a;
--card-bg: #1e293b;
--text-primary: #e5e7eb;
--text-secondary: #9ca3af;
--border: rgba(148, 163, 184, 0.2);

/* Surface Levels */
--surface-0: #050816;         /* Background */
--surface-1: #0f172a;         /* Cards */
--surface-2: #1e293b;         /* Elevated cards */
--surface-3: #334155;         /* Interactive elements */
```

### Typography Scale
```css
/* Display - Page Titles */
--display-lg: 2rem;           /* 32px */
--display-md: 1.5rem;         /* 24px */
--display-sm: 1.25rem;        /* 20px */

/* Headings */
--heading-lg: 1.125rem;       /* 18px - Section headers */
--heading-md: 1rem;           /* 16px - Card titles */
--heading-sm: 0.875rem;       /* 14px - Subheadings */

/* Body */
--body-lg: 1rem;              /* 16px - Primary text */
--body-md: 0.875rem;          /* 14px - Secondary text */
--body-sm: 0.75rem;           /* 12px - Captions */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing System (8px grid)
```css
--space-xs: 4px;    /* 0.25rem */
--space-sm: 8px;    /* 0.5rem */
--space-md: 16px;   /* 1rem */
--space-lg: 24px;   /* 1.5rem */
--space-xl: 32px;   /* 2rem */
--space-2xl: 48px;  /* 3rem */
--space-3xl: 64px;  /* 4rem */
```

### Border Radius
```css
--radius-sm: 8px;   /* Buttons, inputs */
--radius-md: 12px;  /* Cards */
--radius-lg: 16px;  /* Modals */
--radius-xl: 24px;  /* Bottom sheet */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows & Elevation
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.18);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.24);

/* Specific to bottom nav */
--shadow-top: 0 -2px 8px rgba(0, 0, 0, 0.1);
```

---

## Navigation Architecture

### Bottom Navigation Bar (Primary)

**Why Bottom Nav?**
- ✅ Thumb-reachable on large phones (primary device)
- ✅ Industry standard for mobile apps (Instagram, WhatsApp)
- ✅ Always visible for quick context switching
- ✅ Saves vertical space (no collapsing navbar)
- ✅ Better muscle memory for frequent actions

**Recommended 4-Tab Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENT AREA                │
│                                     │
├─────────────────────────────────────┤
│  🏏     📊      🏆      👤         │
│  Home   Stats  Awards  Profile     │
└─────────────────────────────────────┘
```

#### Tab 1: 🏏 Home (Dashboard)
**Purpose**: Quick overview & upcoming actions
**Icon**: Cricket bat or field icon
**Active State**: Blue fill + label
**Content**:
- Next match card (prominent)
- Quick actions (Mark available, View team)
- Recent highlights
- Pending tasks (captain only)

#### Tab 2: 📊 Stats
**Purpose**: Performance analytics
**Icon**: Bar chart or graph
**Content**:
- Personal stats (default for players)
- Team stats (accessible to all)
- Comparison tools
- Filters and sorting

#### Tab 3: 🏆 Awards
**Purpose**: Recognition & achievements
**Icon**: Trophy
**Content**:
- Season awards (existing)
- Personal badges
- Team milestones

#### Tab 4: 👤 Profile
**Purpose**: Settings & personal info
**Icon**: User avatar
**Content**:
- Personal details
- Availability calendar
- Settings
- Logout

**Alternative 5-Tab Structure (If Match Management Added):**
```
Home | Matches | Stats | Awards | Profile
```
- **Matches**: Dedicated section for upcoming/past matches, team selection

### Header Component (Contextual)

**Purpose**: Show context, not navigation
**Height**: 56px fixed
**Structure**:

```
┌──────────────────────────────────────────────┐
│ ☰  Team Sigma          🔔  ⚙️              │
└──────────────────────────────────────────────┘
```

**Left Section**:
- Hamburger menu (only if needed for secondary nav)
- Team name/logo
- Role badge (Captain/Player)

**Right Section**:
- Notifications bell (with badge count)
- Settings gear
- Help icon

**Variations**:
- **On Home**: Shows current team, notifications
- **On Stats**: Shows filters icon, share button
- **On Profile**: Shows edit button
- **On Awards**: Shows season selector

---

## Page-by-Page Redesign

### 1. Home / Dashboard (Redesigned)

**Current Problems**:
- Shows all stats at once → Information overload
- No clear action items
- Same view for captain and player

**New Design Philosophy**:
"Show what matters NOW, hide what can wait"

#### A. Player View

**Hero Section** (Above fold):
```
┌─────────────────────────────────────┐
│  Next Match                      ▸  │
│  📍 MG Road Ground                  │
│  🕐 Tomorrow, 3:00 PM               │
│                                     │
│  Your Status: [Available ✓]        │
│  Team: Not yet selected             │
│                                     │
│  [Change Availability]              │
└─────────────────────────────────────┘
```

**Quick Stats Card**:
```
┌─────────────────────────────────────┐
│  Your Season so Far                 │
│  ┌───────┬──────────┬──────────┐   │
│  │ 125   │ 3 wkts  │ 4 catches│   │
│  │ Runs  │ Taken   │ Taken    │   │
│  └───────┴──────────┴──────────┘   │
│                                     │
│  Batting Avg: 31.2  SR: 142.8      │
│  [View Detailed Stats →]            │
└─────────────────────────────────────┘
```

**Recent Activity Feed**:
```
• Match vs Royal Warriors - Won by 25 runs
  You scored 34(22) and took 1/18

• Awards: Nominated for "Emerging Player"

• Team selection for next match: Pending
```

#### B. Captain View (Additional Elements)

**Pending Actions** (Top priority):
```
┌─────────────────────────────────────┐
│  ⚠️ Action Required                  │
│                                     │
│  • Select XI for Saturday match     │
│    8/11 players confirmed           │
│    [Select Team →]                  │
│                                     │
│  • Update last match scores         │
│    vs Royal Warriors (2 days ago)   │
│    [Enter Scores →]                 │
└─────────────────────────────────────┘
```

**Team Status**:
```
┌─────────────────────────────────────┐
│  Team Sigma - Next Match            │
│                                     │
│  ✅ Available: 15 players           │
│  ❌ Unavailable: 3 players          │
│  ⏱️ Not responded: 2 players        │
│                                     │
│  [View Availability →]              │
│  [Send Reminder]                    │
└─────────────────────────────────────┘
```

**Floating Action Button (FAB)**:
```
        [+ Create Match]
```
- Position: Bottom right, above bottom nav
- Primary action for captains
- Opens match creation flow

---

### 2. Stats Page (Enhanced)

**Current Problems**:
- Tables hard to read on mobile
- Too many tabs (4) competing for attention
- No personalization

**New Approach**: Cards over Tables

#### Personal Stats (Default for Players)

**Header with Toggle**:
```
┌─────────────────────────────────────┐
│  📊 Your Statistics                 │
│  [Personal] [Team Comparison]       │
└─────────────────────────────────────┘
```

**Stat Cards** (Scrollable horizontally):
```
┌───────────┐ ┌───────────┐ ┌───────────┐
│  BATTING  │ │  BOWLING  │ │ FIELDING  │
│           │ │           │ │           │
│  125 Runs │ │  3 Wkts   │ │ 4 Catches │
│  Avg 31.2 │ │  Eco 6.2  │ │ 2 Stumpngs│
│           │ │           │ │           │
│  [Details]│ │  [Details]│ │  [Details]│
└───────────┘ └───────────┘ └───────────┘
```

**Trend Graph**:
```
Runs per Match (Last 10 games)
    50│     ●
      │   ●   ●
    25│ ●       ●   ●
      │           ●   ●
     0└─────────────────────
       Recent → Older
```

**Achievements Section**:
```
🎯 Recent Milestones
• Highest score this season: 54*
• Best bowling: 3/18
• Fastest fifty: 18 balls
```

#### Team Stats (Accessible to All)

**Leaderboards**:
```
┌─────────────────────────────────────┐
│  🏆 Top Performers                  │
│                                     │
│  Most Runs:                         │
│  1. Sujith Shetty    498 runs      │
│  2. Pavan            422 runs      │
│  3. Paras Jain       326 runs      │
│                                     │
│  Most Wickets:                      │
│  1. Sudheer          45 wkts       │
│  2. Braj             37 wkts       │
│  3. Kapil            18 wkts       │
│                                     │
│  [View All Stats →]                 │
└─────────────────────────────────────┘
```

**Filters** (Sticky top bar):
```
[All Time ▼] [All Roles ▼] [Min 5 Inns ▼]
```

---

### 3. Awards Page (Refined)

**Current State**: Good foundation, needs mobile optimization

**Improvements**:

#### Mobile Grid
```
Current: 3 columns on desktop → 1 column on mobile
Proposed: 2 columns on mobile with smaller cards
```

#### Card Enhancements
```
┌──────────────────┬──────────────────┐
│ 🏆 Emerging      │ 🔥 Breakthrough  │
│ Player           │ Bowler           │
│                  │                  │
│ VICKY           │ BRAJ             │
│ 110 runs        │ 37 wkts          │
│ Avg 18.0        │ Eco 6.33         │
│                  │                  │
│ [View All ▸]    │ [View All ▸]    │
└──────────────────┴──────────────────┘
```

#### Interactive Elements
- **Tap card**: Expand to see all nominees
- **Share button**: Share award card as image
- **Voting** (future): Allow team to vote for winners

---

### 4. Profile Page (Comprehensive)

**Current**: Basic profile creation form
**Needed**: Full profile management

#### Profile Header
```
┌─────────────────────────────────────┐
│              [Avatar]                │
│          Sudheer Ranjan              │
│         @sudheer_cricket             │
│                                      │
│    BATTER • Jersey #7 • Right Arm   │
│         Team Sigma • 2 Years         │
│                                      │
│  ┌──────────┬──────────┬──────────┐ │
│  │    15    │   125    │   3      │ │
│  │  Matches │   Runs   │  Wickets │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
```

#### Sections (Accordion/Tabs)

**1. Personal Info**
```
📝 Personal Details
   Name, Gender, Mobile, City
   [Edit]

📍 Playing Details
   Primary Role, Jersey Size, Batting Style
   Bowling Style, Preferred Position
   [Edit]

💳 Payment Info
   UPI ID, Bank Details (for prize money)
   [Edit]
```

**2. Availability Calendar**
```
📅 Upcoming Availability

   Jan 15 (Sat) - MG Road Ground
   Status: ✅ Available
   [Change]

   Jan 22 (Sat) - JP Nagar
   Status: ❓ Not responded yet
   [Mark Available] [Mark Unavailable]

   [View Calendar →]
```

**3. Performance Trends**
```
📈 Your Progress

   Batting Average: 31.2 (↑ 12% this month)
   Strike Rate: 142.8 (↓ 3% this month)

   [Detailed Analytics →]
```

**4. Settings**
```
⚙️ App Settings

   • Notifications
     Match reminders: ON
     Team selection: ON
     Awards updates: ON

   • Privacy
     Show stats to: Everyone

   • Theme
     Dark mode: ON
```

**5. Logout**
```
🚪 Account
   [Change Password]
   [Logout]
```

---

### 5. NEW: Matches Page (Future MVP Addition)

**Purpose**: Central hub for match management

#### For Players

**Upcoming Matches Tab**:
```
┌─────────────────────────────────────┐
│  Saturday, Jan 15                   │
│  📍 MG Road Ground, 3:00 PM         │
│                                     │
│  Team Sigma vs Royal Warriors       │
│                                     │
│  Your Status: ✅ Available          │
│  Selection: Not announced yet       │
│                                     │
│  [View Details] [Change Status]     │
└─────────────────────────────────────┘
```

**Past Matches Tab**:
```
┌─────────────────────────────────────┐
│  Team Sigma 165/6 (20)              │
│  vs                                  │
│  Royal Warriors 142 (18.4)          │
│                                     │
│  ✅ Won by 23 runs                   │
│                                     │
│  Your Performance:                   │
│  • Batting: 34(22) - 2 fours, 1 six│
│  • Bowling: 1/18 (4 overs)          │
│                                     │
│  [View Scorecard]                   │
└─────────────────────────────────────┘
```

#### For Captains (Additional Features)

**Create Match Flow**:
```
Step 1: Match Details
┌─────────────────────────────────────┐
│  Opponent Team Name                 │
│  [Enter team name]                  │
│                                     │
│  Date & Time                        │
│  [Select date] [Select time]        │
│                                     │
│  Venue                              │
│  [MG Road Ground ▼]                 │
│  Or [Enter custom venue]            │
│                                     │
│  Match Type                         │
│  [T20 ▼] [ODI] [Test]              │
│                                     │
│            [Next →]                 │
└─────────────────────────────────────┘

Step 2: Invite Team
┌─────────────────────────────────────┐
│  Send Invitation To:                │
│  ☑️ All Players (20)                │
│  ☐ Select Specific Players          │
│                                     │
│  Message (Optional)                 │
│  [Hey team, important match...]     │
│                                     │
│  RSVP Deadline                      │
│  [2 days before match ▼]            │
│                                     │
│    [Back]        [Send Invite →]    │
└─────────────────────────────────────┘
```

**Team Selection Interface**:
```
┌─────────────────────────────────────┐
│  Select Playing XI                  │
│  vs Royal Warriors - Jan 15         │
│                                     │
│  Available: 15 players              │
│  Selected: 8/11                     │
│                                     │
│  🏏 BATTERS (Select 6)              │
│  ✅ Sujith Shetty  498 runs, 31 avg│
│  ✅ Pavan          422 runs, 35 avg│
│  ✅ Paras Jain     326 runs         │
│  ☐ Ayush          205 runs         │
│                                     │
│  🎯 BOWLERS (Select 4)              │
│  ✅ Sudheer        45 wkts, 6.07 eco│
│  ✅ Braj           37 wkts          │
│  ☐ ROHIT          15 wkts          │
│                                     │
│  🧤 KEEPER (Select 1)               │
│  ☐ Not selected yet                │
│                                     │
│  AI Suggestion: Based on recent     │
│  form, consider adding Rana         │
│  [View Suggestion]                  │
│                                     │
│  [Save as Draft] [Finalize Team]    │
└─────────────────────────────────────┘
```

**Match Score Entry**:
```
┌─────────────────────────────────────┐
│  Quick Score Entry                  │
│  Team Sigma vs Royal Warriors       │
│                                     │
│  Our Score                          │
│  Runs: [165]  Wickets: [6/10]      │
│  Overs: [20.0]                      │
│                                     │
│  Opponent Score                     │
│  Runs: [142]  Wickets: [10/10]     │
│  Overs: [18.4]                      │
│                                     │
│  Result: [Won ▼] by [23] runs      │
│                                     │
│  [Enter Detailed Scorecard] (opt.)  │
│                                     │
│            [Save Result]            │
└─────────────────────────────────────┘
```

---

## Component Library

### Core Components to Build

#### 1. Bottom Navigation
```jsx
<BottomNav>
  <NavItem icon="home" label="Home" active />
  <NavItem icon="stats" label="Stats" />
  <NavItem icon="trophy" label="Awards" />
  <NavItem icon="user" label="Profile" badge={2} />
</BottomNav>
```

**Specs**:
- Height: 64px
- Icon size: 24px
- Active state: Icon + label colored, scale 1.05
- Inactive: Gray, opacity 0.6
- Badge: Red dot for notifications

#### 2. Header Bar
```jsx
<Header
  title="Team Sigma"
  subtitle="Captain"
  leftIcon="menu"
  rightIcons={['notifications', 'settings']}
  notificationCount={3}
/>
```

#### 3. Match Card
```jsx
<MatchCard
  opponent="Royal Warriors"
  date="Jan 15, 3:00 PM"
  venue="MG Road Ground"
  userStatus="available"
  selectionStatus="pending"
  onStatusChange={handleStatusChange}
/>
```

#### 4. Stat Card
```jsx
<StatCard
  category="batting"
  primaryStat={{ label: "Runs", value: 125 }}
  secondaryStats={[
    { label: "Avg", value: 31.2 },
    { label: "SR", value: 142.8 }
  ]}
  trend="up"
  onViewDetails={() => {}}
/>
```

#### 5. Player List Item
```jsx
<PlayerListItem
  name="Sujith Shetty"
  role="Batter"
  stats="498 runs, 31 avg"
  availability="available"
  selected={true}
  onToggleSelect={() => {}}
/>
```

#### 6. Availability Toggle
```jsx
<AvailabilityToggle
  status="available" // available | unavailable | maybe
  onChange={(newStatus) => {}}
/>
```

**Design**:
```
┌─────────────────────────────────┐
│ [Available] [Maybe] [Not Avail] │
└─────────────────────────────────┘
```

#### 7. Action Sheet (Bottom Modal)
```jsx
<ActionSheet
  isOpen={true}
  title="Change Availability"
  actions={[
    { label: 'Available', icon: 'check', variant: 'success' },
    { label: 'Maybe', icon: 'clock', variant: 'warning' },
    { label: 'Not Available', icon: 'x', variant: 'danger' }
  ]}
  onClose={() => {}}
/>
```

#### 8. Floating Action Button
```jsx
<FAB
  icon="plus"
  label="Create Match"
  position="bottom-right"
  onClick={handleCreateMatch}
/>
```

---

## Mobile-First Considerations

### Touch Targets
- **Minimum**: 44x44px (iOS) / 48x48px (Android)
- **Recommended**: 48x48px for all interactive elements
- **Spacing**: 8px minimum between touch targets

### Gesture Support

**Swipe Gestures**:
- Swipe left on match card → Mark unavailable
- Swipe right on match card → Mark available
- Pull down on lists → Refresh data
- Swipe between tabs → Navigate stats categories

**Long Press**:
- Long press on player → Show quick stats
- Long press on match → More options menu

### Thumb Zone Optimization
```
Phone Screen (in hand)
┌─────────────────┐
│  Easy Reach     │ ← Header, secondary actions
│                 │
│  Natural Reach  │ ← Primary content
│                 │
│  Easy Reach     │ ← Bottom nav, FAB
└─────────────────┘
```

**Design Principles**:
- Primary actions in bottom 1/3 of screen
- Secondary actions in top 1/3
- Critical content in middle

### Offline Support
- Show cached data when offline
- Queue actions (mark availability) for sync
- Clear indicators when offline
- Auto-sync when online

### Performance
- Lazy load stats tables
- Infinite scroll for match history
- Image optimization for player avatars
- Skeleton screens for loading states

---

## Implementation Roadmap

### Phase 1: Navigation Overhaul (Week 1-2)
**Goal**: Implement new navigation system

**Tasks**:
1. Create BottomNav component
2. Create new Header component
3. Refactor App.jsx routing
4. Update all pages to work with new nav
5. Add page transitions
6. Test on multiple devices

**Success Metrics**:
- Navigation accessible within 1 tap from anywhere
- Page load time < 2 seconds
- No layout shifts during navigation

### Phase 2: Home Dashboard Redesign (Week 3-4)
**Goal**: Role-based home screens

**Tasks**:
1. Create RoleContext for captain/player differentiation
2. Build MatchCard component
3. Build QuickStatsCard component
4. Implement action items for captains
5. Add FAB for match creation (UI only)
6. Build responsive layouts

**Success Metrics**:
- Users understand next action within 3 seconds
- 80% reduction in taps to mark availability
- Clear visual hierarchy

### Phase 3: Stats Page Enhancement (Week 5-6)
**Goal**: Mobile-optimized stats viewing

**Tasks**:
1. Convert tables to card-based layout
2. Implement personal vs team toggle
3. Add trend graphs
4. Build comparison tools
5. Add filters with bottom sheet
6. Optimize for performance

**Success Metrics**:
- No horizontal scrolling required
- Stats load in < 1 second
- Comparison feature used by 50%+ users

### Phase 4: Profile Page Completion (Week 7)
**Goal**: Comprehensive profile management

**Tasks**:
1. Build availability calendar
2. Add performance trends
3. Implement settings
4. Add edit flows for all sections
5. Upload avatar functionality

**Success Metrics**:
- Profile completion rate > 90%
- Availability calendar used weekly

### Phase 5: Match Management (Week 8-10)
**Goal**: Core captain features

**Tasks**:
1. Create Matches page
2. Build match creation flow
3. Implement team selection interface
4. Add availability tracking
5. Build score entry form
6. Add match history view

**Success Metrics**:
- Captains create matches in < 2 minutes
- Team selection in < 5 minutes
- 90% player response rate within 24 hours

---

## Future Enhancements (Post-MVP)

### Phase 6: Notifications & Real-Time
- Push notifications for match invites
- Real-time availability updates
- Live match scoring
- Team chat integration

### Phase 7: Advanced Analytics
- Performance trends over time
- AI-powered team selection suggestions
- Opposition analysis
- Player comparison tools

### Phase 8: Social Features
- Match photo gallery
- Post-match reactions
- Player of the match voting
- Social media sharing

### Phase 9: Team Management
- Multiple teams support
- Team roster management
- Sub/guest player system
- Team finances tracking

### Phase 10: Tournament Mode
- Create tournament brackets
- League tables
- Playoff systems
- Season leaderboards

---

## Design Specifications

### Responsive Breakpoints
```css
/* Mobile First */
--mobile: 320px;       /* Minimum support */
--mobile-lg: 428px;    /* iPhone 14 Pro Max */
--tablet: 768px;       /* iPad */
--desktop: 1024px;     /* Laptop */
--desktop-lg: 1440px;  /* Large desktop */
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-toast: 700;
```

### Animation Timings
```css
--timing-instant: 100ms;
--timing-fast: 200ms;
--timing-normal: 300ms;
--timing-slow: 500ms;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Accessibility

**WCAG 2.1 AA Compliance**:
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- All interactive elements keyboard accessible
- ARIA labels for screen readers
- Focus indicators visible

**Dark Theme Considerations**:
- Reduce pure white (#fff) → Use #e5e7eb
- Avoid pure black (#000) → Use #050816
- Ensure sufficient contrast on dark backgrounds

---

## Interaction Patterns

### Loading States
```
Skeleton Screen Pattern:
┌─────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │
│  ▓▓▓▓▓▓▓▓▓▓                         │
│                                     │
│  ▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓            │
│  ▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓            │
└─────────────────────────────────────┘
```

### Empty States
```
┌─────────────────────────────────────┐
│              🏏                      │
│                                     │
│      No Upcoming Matches            │
│                                     │
│   Ask your captain to create one    │
│                                     │
│      [Create Match] (Captain)       │
└─────────────────────────────────────┘
```

### Error States
```
┌─────────────────────────────────────┐
│              ⚠️                      │
│                                     │
│   Couldn't Load Match Details       │
│                                     │
│   Check your internet connection    │
│                                     │
│          [Try Again]                │
└─────────────────────────────────────┘
```

### Success Feedback
```
Toast Notification:
┌─────────────────────────────────────┐
│  ✅ Availability marked as Available│
└─────────────────────────────────────┘
(Auto-dismiss after 3 seconds)
```

---

## Metrics & KPIs

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Session duration
- Feature adoption rates

### Feature-Specific
- **Availability**: Response rate within 24h
- **Team Selection**: Time to select XI
- **Stats**: Time spent on stats page
- **Profile**: Profile completion rate

### Performance
- Page load time (target: < 2s)
- Time to interactive (target: < 3s)
- API response time (target: < 500ms)
- Error rate (target: < 1%)

### Usability
- Task completion rate
- Error recovery rate
- User satisfaction (NPS score)
- Feature discoverability

---

## Conclusion

This redesign transforms PlayMatch from a stats viewer into a comprehensive team management platform. The bottom navigation, role-based dashboards, and mobile-first approach directly address the needs of captains organizing matches and players tracking their involvement.

**Key Benefits**:
1. ✅ **Faster Navigation**: Bottom nav reduces taps by 40%
2. ✅ **Clear Hierarchy**: Users see critical info first
3. ✅ **Role Optimization**: Captains and players get tailored experiences
4. ✅ **Mobile Native**: Gestures, touch targets, thumb zones optimized
5. ✅ **Actionable**: Every screen has a clear next step

**Next Steps**:
1. Review and approve this design document
2. Create high-fidelity mockups/prototypes
3. User testing with 5-10 team captains/players
4. Begin Phase 1 implementation
5. Iterate based on user feedback

---

**Document Version**: 1.0
**Last Updated**: January 11, 2026
**Author**: UI/UX Design Lead
**Status**: Pending Review
