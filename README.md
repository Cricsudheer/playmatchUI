# PlayMatch - Cricket Team Management Platform

A modern web application for cricket team captains and players to manage teams, organize matches, track statistics, and handle team payments.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features & Flows](#key-features--flows)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Architecture Rules](#architecture-rules)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [API Endpoints](#api-endpoints)

---

## Project Overview

### What Problem Does This Solve?

PlayMatch helps cricket captains and players manage their teams more effectively:

**For Captains:**
- Create and manage teams
- Invite players to join
- Organize matches and events
- Track team statistics
- Handle team payments and finances

**For Players:**
- Join teams via invite codes
- View personal and team statistics
- Track upcoming events
- Manage player profile

### Who Uses This?

- **Team Captains/Admins**: Create teams, invite members, organize matches
- **Coordinators**: Help manage team events and activities
- **Players**: Join teams, participate in matches, view stats

---

## Key Features & Flows

### 1. Authentication Flow
```
User visits app → Login/Signup → Authentication check
```

### 2. Onboarding Flow (New Users)
```
New user signs up
  → Check if user has teams
  → NO teams? → Redirect to /onboarding
  → User can:
     - Create a new team (becomes admin)
     - Join with invite code
     - Browse teams (coming soon)
  → After joining/creating team → Redirect to /app/home
```

### 3. Team Selector Flow
```
User with multiple teams
  → Header shows team selector dropdown
  → Click to switch between teams
  → Selected team persisted in localStorage
  → App pages show data for selected team
```

### 4. Main App Flow (Authenticated Users with Team)
```
/app/home     → Dashboard with team overview
/app/stats    → Team and player statistics
/app/teams    → Team management, invites
/app/events   → Upcoming matches and events
/app/profile  → User profile and settings
```

### 5. Invite Deep Link Flow
```
User clicks invite link → /invite/:code
  → NOT logged in? → Save code → Redirect to /login
  → After login → Auto-join team with saved code
  → Logged in? → Join team immediately
```

---

## Tech Stack

### Frontend
- **React 18** - UI library with functional components and hooks
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management, caching, mutations
- **Plain CSS** - No CSS frameworks, custom design system
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Vite** - Build tool and dev server

### State Management
- **React Context** - Global state (auth, team selection)
- **React Query** - Server state, caching
- **localStorage** - Persistence (tokens, selectedTeamId)

### Backend Integration
- REST API with JWT authentication
- Bearer token in Authorization header
- Backend base URL configurable via environment variables

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (tested with v24.9.0)
- **npm**: v9.0.0 or higher
- **Backend API**: Running backend service (see Backend Setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playMatchUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your backend URL (see [Environment Variables](#environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:5173`

### Backend Setup

Ensure your backend API is running and accessible. Default configuration:
- **Development**: `http://localhost:8080`
- **Production**: Configure via `VITE_API_URL` environment variable

### Available Scripts

```bash
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
npm run format     # Format code with Prettier
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_URL` | Main backend API base URL | `http://localhost:8080` | `https://api.playmatch.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AUTH_BASE_URL` | Auth service URL (if different from main API) | Same as `VITE_API_URL` |
| `VITE_API_BASE_URL` | Legacy stats API URL | `https://playmatch-preprod.onrender.com` |

### Example `.env` File

See `.env.example` for a complete example configuration.

### Important Notes

- All Vite environment variables must be prefixed with `VITE_`
- Variables are embedded at build time (not runtime)
- Never commit `.env` to version control
- Use `.env.local` for local overrides (also gitignored)

---

## Folder Structure

```
src/
├── api/                   # API layer - Pure functions for HTTP requests
│   ├── http.js           # Base HTTP client with auth and error handling
│   └── teams.api.js      # Team-specific API endpoints
│
├── components/           # Reusable UI components (presentational)
│   ├── layout/          # Layout components (Header, BottomNav, TeamSelector)
│   └── ...              # Other reusable components
│
├── constants/            # App constants and configuration
│   ├── routes.js        # Route path constants (single source of truth)
│   ├── config.js        # API config, feature flags
│   ├── authConfig.js    # Auth endpoints, validation rules
│   └── profileConfig.js # Profile field configurations
│
├── contexts/             # React Context providers for global state
│   └── TeamContext.jsx  # Selected team state management
│
├── hooks/                # Custom React hooks for data fetching
│   ├── useAuth.jsx      # Authentication hook (login, signup, logout)
│   ├── useMyTeams.js    # Teams data fetching and mutations
│   ├── mutations/       # React Query mutation hooks
│   └── queries/         # React Query query hooks
│
├── lib/                  # Third-party library configurations
│   └── queryClient.js   # React Query client setup
│
├── pages/                # Route-level page components
│   ├── app/             # Authenticated app pages
│   │   ├── HomePage.jsx
│   │   ├── StatsPage.jsx
│   │   ├── TeamsPage.jsx
│   │   ├── EventsPage.jsx
│   │   └── ProfilePage.jsx
│   ├── onboarding/      # Onboarding flow pages
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── OnboardingHub.jsx
│   ├── PlayerProfilePage.jsx
│   └── InviteHandler.jsx
│
├── routes/               # Route guard components
│   ├── ProtectedRoute.jsx    # Requires authentication
│   ├── PublicOnlyRoute.jsx   # Redirects if authenticated
│   └── OnboardingRoute.jsx   # Prevents access if user has teams
│
├── services/             # Business logic and API orchestration
│   ├── authService.js   # Auth API calls (login, register, refresh)
│   └── playerProfileService.js
│
├── styles/               # Global CSS and style modules
│   ├── index.css        # Global styles, design tokens
│   ├── app.css          # App layout styles (header, nav, content)
│   └── main.css         # Additional global styles
│
├── utils/                # Utility functions and helpers
│   ├── authUtils.js     # Token management, localStorage helpers
│   ├── team.js          # Team data normalization utilities
│   ├── logger.js        # DEV-only logging utility
│   ├── redirectUtils.js # Post-login redirect logic
│   ├── errorHandlers.js # Global error handling (401, etc.)
│   └── validationUtils.js
│
├── App.jsx               # Root component with route definitions
├── main.jsx              # App entry point (React root)
└── index.css             # Global CSS reset and variables
```

### Folder Responsibilities

#### `api/` - API Layer
- **Purpose**: Pure functions that make HTTP requests
- **What lives here**: API endpoint functions, HTTP client
- **Rules**:
  - Functions should be pure (no side effects)
  - No React hooks
  - No business logic (just HTTP calls)
  - Returns promises with raw API data

#### `hooks/` - Data Fetching
- **Purpose**: Custom React hooks for data fetching and state
- **What lives here**: React Query hooks, custom state hooks
- **How they map to pages**:
  - `useMyTeams()` → Used in Header, TeamSelector, OnboardingHub
  - `useAuth()` → Used everywhere for authentication state
  - `useCreateTeam()` → Used in OnboardingHub, CreateTeamPage
- **Rules**:
  - Must follow React hooks rules (start with `use`)
  - Use React Query for server state
  - Can call API functions from `api/`

#### `contexts/` - Global State
- **Purpose**: Global application state
- **What lives here**:
  - `TeamContext` - Selected team ID (persisted to localStorage)
  - `AuthContext` - Currently in `hooks/useAuth.jsx`
- **Why we use context**:
  - Share state across entire app without prop drilling
  - Persist state (selectedTeamId) to localStorage
  - Keep components clean

#### `pages/` - Route Screens
- **Purpose**: Route-level components (screens)
- **What lives here**: Components that map to routes
- **Rules**:
  - Pages use hooks to fetch data
  - Pages compose smaller components
  - Pages don't contain business logic

#### `components/` - UI Components
- **Purpose**: Reusable, presentational UI components
- **What lives here**: Buttons, cards, forms, layout components
- **Rules**:
  - Should be "dumb" (receive props, render UI)
  - Don't fetch data directly
  - Can use small local state (useState)

#### `utils/` - Helper Functions
- **Purpose**: Helper functions and utilities
- **What lives here**: Pure functions for common tasks
- **Examples**:
  - `getTeamId(team)` - Normalize team ID from API
  - `logger.debug()` - DEV-only console logging
  - `isPublicRoute(path)` - Route checking

---

## Architecture Rules

### Core Principles (Must Follow)

#### 1. Components Don't Fetch Data
```javascript
// ❌ BAD - Component fetches data directly
function TeamCard() {
  const [team, setTeam] = useState(null);

  useEffect(() => {
    fetch('/api/teams/123').then(/* ... */);
  }, []);

  return <div>{team?.name}</div>;
}

// ✅ GOOD - Component receives data via props or hook
function TeamCard({ team }) {
  return <div>{team.name}</div>;
}

// ✅ ALSO GOOD - Page uses hook, passes to component
function TeamsPage() {
  const { data: teams } = useMyTeams();
  return <TeamCard team={teams[0]} />;
}
```

#### 2. Hooks Fetch Data via React Query
```javascript
// ✅ GOOD - Hook uses React Query
export function useMyTeams() {
  return useQuery({
    queryKey: ['myTeams'],
    queryFn: getMyTeams,  // API function
  });
}

// ❌ BAD - Direct fetch in hook
export function useMyTeams() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    fetch('/api/teams').then(/* ... */);  // Don't do this!
  }, []);
  return teams;
}
```

#### 3. API Functions Are Pure
```javascript
// ✅ GOOD - Pure function
export async function getMyTeams() {
  return await httpGet('/api/teams/user');
}

// ❌ BAD - Side effects in API function
export async function getMyTeams() {
  const teams = await httpGet('/api/teams/user');
  localStorage.setItem('teams', JSON.stringify(teams));  // Side effect!
  return teams;
}
```

#### 4. Where State Lives

| State Type | Where It Lives | Why |
|------------|----------------|-----|
| **Server data** (teams, stats) | React Query cache | Automatic caching, refetching, mutations |
| **Auth state** (user, isAuthenticated) | `useAuth` context | Shared across app, persisted to localStorage |
| **Selected team ID** | `TeamContext` | Shared across app, persisted to localStorage |
| **Form input** | Component local state (`useState`) | Only used in one component |
| **UI state** (modal open) | Component local state | Only affects one component |

#### 5. How Onboarding Redirect Works

The onboarding redirect flow ensures users are sent to the right place based on their authentication and team membership status:

```
1. User logs in → authService.login() saves tokens

2. BootstrapGate waits for auth AND teams to load
   (prevents race conditions between auth check and teams fetch)

3. ProtectedRoute checks:
   - Not authenticated? → Redirect to /login
   - requireTeam=true AND no teams? → Redirect to /onboarding

4. OnboardingRoute checks:
   - Has teams? → Redirect to /app/home
   - No teams? → Show onboarding

5. PublicOnlyRoute (login/signup) checks:
   - Authenticated + has teams? → Redirect to /app/home
   - Authenticated + no teams? → Redirect to /onboarding
```

**Where selectedTeamId is stored:**
- **Location**: `localStorage` (key: `'selectedTeamId'`)
- **Managed by**: `TeamContext` (`contexts/TeamContext.jsx`)
- **Auto-selected**: When user has teams, first team is auto-selected if no selection exists
- **Persistence**: Survives page refresh
- **Cleared on**: Logout (via `clearAuth()` in `utils/authUtils.js`)

#### 6. Route Guards Pattern

```javascript
// App.jsx route structure
<Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
<Route path="/onboarding" element={<ProtectedRoute><OnboardingRoute><OnboardingHub /></OnboardingRoute></ProtectedRoute>} />
<Route path="/app/*" element={<ProtectedRoute requireTeam><AppLayout /></ProtectedRoute>} />
```

---

## Common Tasks

### Add a New API Endpoint

1. **Add API function** in `src/api/teams.api.js` (or create new file):
   ```javascript
   export async function getTeamDetails(teamId) {
     return await httpGet(`/api/teams/${teamId}`);
   }
   ```

2. **Create React Query hook** in `src/hooks/` or `src/hooks/queries/`:
   ```javascript
   import { useQuery } from '@tanstack/react-query';
   import { getTeamDetails } from '../api/teams.api';

   export function useTeamDetails(teamId) {
     return useQuery({
       queryKey: ['team', teamId],
       queryFn: () => getTeamDetails(teamId),
       enabled: !!teamId,
     });
   }
   ```

3. **Use in component**:
   ```javascript
   function TeamDetailsPage() {
     const { selectedTeamId } = useTeamContext();
     const { data: team, isLoading } = useTeamDetails(selectedTeamId);

     if (isLoading) return <div>Loading...</div>;
     return <div>{team.name}</div>;
   }
   ```

### Add a New Page

1. **Create page component** in `src/pages/app/`:
   ```javascript
   // src/pages/app/PlayersPage.jsx
   export default function PlayersPage() {
     const { data: players } = usePlayers();

     return (
       <div className="app-content">
         <h1>Players</h1>
         {/* ... */}
       </div>
     );
   }
   ```

2. **Add route constant** in `src/constants/routes.js`:
   ```javascript
   export const ROUTES = {
     // ...
     APP: {
       HOME: '/app/home',
       PLAYERS: '/app/players',  // Add this
     },
   };
   ```

3. **Add route** in `src/App.jsx`:
   ```javascript
   import PlayersPage from './pages/app/PlayersPage';

   // Inside <Routes>
   <Route path="/app/players" element={<PlayersPage />} />
   ```

### Add a New Tab in Bottom Nav

1. **Update BottomNav** in `src/components/layout/BottomNav.jsx`:
   ```javascript
   import { Users } from 'lucide-react';  // Import icon

   const navItems = [
     // ...existing items
     { path: ROUTES.APP.PLAYERS, icon: Users, label: 'Players' },
   ];
   ```

2. **Ensure route exists** (see "Add a New Page" above)

### Add a New Field to Create Team Form

1. **Update API call** in `src/api/teams.api.js`:
   ```javascript
   export async function createTeam(payload) {
     // payload can now include new field
     return await httpPost('/api/teams', payload);
   }
   ```

2. **Update form** in `src/pages/OnboardingHub.jsx`:
   ```javascript
   const [formData, setFormData] = useState({
     name: '',
     city: '',
     description: '',
     logoUrl: '',
     newField: '',  // Add here
   });

   // Add input in JSX:
   <input
     value={formData.newField}
     onChange={(e) => setFormData({ ...formData, newField: e.target.value })}
   />
   ```

3. **Update mutation call**:
   ```javascript
   await createTeamMutation.mutateAsync({
     name: formData.name.trim(),
     city: formData.city.trim(),
     description: formData.description.trim() || undefined,
     newField: formData.newField.trim() || undefined,
   });
   ```

---

## Troubleshooting

### 401 Unauthorized Error

**Symptoms:**
- Automatically logged out
- "Session expired" message
- API requests failing with 401

**Causes & Solutions:**

1. **Token expired**
   - Tokens have expiration time
   - Solution: Log in again

2. **Backend not running**
   - Check if backend server is running
   - Verify `VITE_API_URL` in `.env`
   ```bash
   # Test backend health
   curl http://localhost:8080/health
   ```

3. **Token not sent**
   - Check browser DevTools → Network → Request Headers
   - Should see `Authorization: Bearer <token>`
   - If missing, clear localStorage and log in again:
   ```javascript
   // Browser console
   localStorage.clear();
   location.reload();
   ```

### CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:8080/api/teams' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution:**
- Backend must allow CORS from frontend origin
- Backend should set headers:
  ```
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Headers: Authorization, Content-Type
  ```
- Contact backend developer to enable CORS

### Backend Not Running

**Symptoms:**
- Network errors
- `ERR_CONNECTION_REFUSED`
- "Failed to fetch"

**Solution:**
1. Check if backend is running:
   ```bash
   curl http://localhost:8080/health
   ```

2. Verify environment variable:
   ```bash
   # In .env
   VITE_API_URL=http://localhost:8080
   ```

3. Restart dev server after changing `.env`:
   ```bash
   npm run dev
   ```

### Empty Teams Issue

**Symptoms:**
- User logged in but shows "No teams" in selector
- Stuck on onboarding page

**Possible Causes:**

1. **User genuinely has no teams**
   - Solution: Create a team via onboarding

2. **API returning empty array**
   - Check Network tab: `GET /api/teams/user`
   - Should return `{ teams: [...] }`
   - If `{ teams: [] }`, user has no teams

3. **selectedTeamId persisted from different user** (FIXED)
   - Old bug: `selectedTeamId` wasn't cleared on logout
   - Fixed in: `utils/authUtils.js` - `clearAuth()` now removes `selectedTeamId`
   - If experiencing old cached data: Clear localStorage manually
   ```javascript
   localStorage.removeItem('selectedTeamId');
   location.reload();
   ```

### Invite Deep Link Not Working

**Expected Behavior:**
```
User clicks: https://app.com/invite/ABC123
  → Not logged in? → Save code → Redirect to /login → After login → Auto-join team
  → Logged in? → Join team immediately
```

**Debugging:**
1. Check `InviteHandler.jsx` - should save code to `localStorage.invitePendingCode`
2. After login, `redirectUtils.getPostLoginRedirect()` checks for pending invite
3. If not working:
   ```javascript
   // Browser console - check saved code
   console.log(localStorage.getItem('invitePendingCode'));
   ```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/v1/auth/login` | Login user | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/v1/auth/register` | Register new user | `{ email, password, name, gender }` | `{ user }` |
| POST | `/v1/auth/refresh-token` | Refresh access token | - | `{ accessToken }` |

### Teams

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/teams/user` | Get current user's teams | ✅ | - | `{ teams: [...] }` |
| POST | `/api/teams` | Create new team | ✅ | `{ name, city, description?, logoUrl? }` | `{ teamId, teamName, ... }` |
| POST | `/api/teams/join` | Join team via invite code | ✅ | `{ inviteCode }` | `{ team }` |

### Player Profile

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/players/profile/:userId` | Get player profile | ✅ | - | `{ profile }` |
| POST | `/api/players/profile` | Create player profile | ✅ | `{ name, age, gender, ... }` | `{ profile }` |
| PUT | `/api/players/profile` | Update player profile | ✅ | `{ name, age, gender, ... }` | `{ profile }` |

### Stats (Legacy API)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/sigma/api/players/all/stats` | Get all players stats | ❌ |

---

## Additional Documentation

- **Architecture Deep Dive**: See `docs/ARCHITECTURE.md` for detailed architecture diagrams and patterns

---

## Support

For issues, questions, or feature requests:
- Create an issue in the GitHub repository
- Contact the development team
- Check backend API status if experiencing connectivity issues

---

## License

Proprietary - PlayMatch Platform
