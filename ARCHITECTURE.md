# Architecture Documentation

## Project Overview

The SIGMA Cricket Team Dashboard is a modern React application that displays comprehensive cricket team statistics with an emphasis on player performance metrics and data visualization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (React Components - src/components/)                        │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
    ┌────────▼────────┐                 ┌────────▼────────┐
    │   Page Layout   │                 │  Data Display   │
    │  Components     │                 │  Components     │
    │ ─────────────── │                 │ ─────────────── │
    │ • Header        │                 │ • OverviewTable │
    │ • TabNavigation │                 │ • BattingTable  │
    │ • InsightsPanel │                 │ • BowlingTable  │
    │                 │                 │ • FieldingTable │
    │                 │                 │ • HighlightCard │
    │                 │                 │ • Bar           │
    └────────┬────────┘                 └────────┬────────┘
             │                                    │
             └─────────────┬──────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    LOGIC LAYER                               │
│  (Hooks - src/hooks/, Utils - src/utils/)                  │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Custom Hooks          │  Utility Functions                 │
│  ──────────────────    │  ──────────────────                │
│  • usePlayerStats      │  • enrichPlayers()                 │
│    - Fetches data      │  • calculateStats()                │
│    - Manages state     │  • calculatePlayerImpact()         │
│    - Error handling    │  • formatDecimal()                 │
│                        │  • formatPercentage()              │
│                        │  • classNames()                    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                  DATA & SERVICES LAYER                        │
│  (Services - src/services/, Constants - src/constants/)     │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  API Services          │  Configuration                     │
│  ──────────────────    │  ─────────────────                │
│  • playerService.js    │  • config.js                       │
│    - fetchPlayerStats()│    - API_CONFIG                    │
│    - Calls API         │    - TABS                          │
│    - Enriches data     │    - BATTING_SORT_OPTIONS          │
│                        │    - BOWLING_SORT_OPTIONS          │
│                        │    - MIN_INNINGS_OPTIONS           │
│                        │    - ROLES                         │
│                        │    - IMPACT_WEIGHTS                │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   EXTERNAL API LAYER                          │
│                                                              │
│  Backend API                                                │
│  ───────────────────────────────────────────────────────    │
│  https://playmatch-preprod.onrender.com                     │
│  GET /sigma/api/players/all/stats                           │
│                                                              │
│  Response: Array<{                                          │
│    playerId, playerName,                                    │
│    battingStats, bowlingStats, dismissalStats              │
│  }>                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Load
```
App Component
    ↓
usePlayerStats Hook
    ↓
playerService.fetchPlayerStats()
    ↓
Backend API
    ↓
enrichPlayers() utility
    ↓
calculateStats() utility
    ↓
Component State Updated
    ↓
Components Render
```

### 2. User Interaction
```
User clicks tab / filter / sort
    ↓
Component State Updates
    ↓
Component Re-renders
    ↓
useMemo() checks dependencies
    ↓
Calculations run if needed
    ↓
Memoized results cached
```

## Component Hierarchy

```
App.jsx (Main Orchestrator)
├── Header
│   └── Meta Pills (Squad Size, Runs, Wickets)
├── HighlightsSection
│   ├── HighlightCard (Top Run Scorer)
│   ├── HighlightCard (Top Wicket Taker)
│   └── HighlightCard (Top Keeper)
├── TabNavigation
│   ├── Tab: Overview
│   ├── Tab: Batting
│   ├── Tab: Bowling
│   └── Tab: Fielding
├── MainPanel
│   ├── OverviewTable
│   │   └── TableWrapper
│   │       └── Bar (multiple)
│   ├── BattingTable
│   │   ├── Panel Controls (select, buttons)
│   │   └── TableWrapper
│   │       └── Bar (multiple)
│   ├── BowlingTable
│   │   ├── Panel Controls (buttons)
│   │   └── TableWrapper
│   │       └── Bar (multiple)
│   └── FieldingTable
│       └── TableWrapper
│           └── Bar (multiple)
└── InsightsPanel
    ├── Header (title, tag)
    ├── Insight Items
    │   ├── Bullet Icon
    │   ├── Main Content
    │   │   ├── Label
    │   │   ├── Meta
    │   │   └── Chips
    │   └── Footer Note
```

## State Management Strategy

### Component State
- `activeTab` - Current active tab (Overview, Batting, etc.)
- `batSortBy` - Batting table sort option
- `batMinInns` - Batting table minimum innings filter
- `bowlSortBy` - Bowling table sort option

### Hook State (usePlayerStats)
- `players` - Array of enriched player objects
- `loading` - Boolean loading state
- `error` - Error message string

### Memoized Calculations (useMemo)
- `stats` - Calculated aggregations and rankings
  - battingPlayers, bowlingPlayers, fieldingPlayers
  - totalRuns, totalWickets
  - topRunScorer, topWicketTaker, topKeeper, bestEconomy

## File Organization

```
src/
├── components/                 # UI Components (11 files)
│   ├── Bar.jsx                # Visual bar chart
│   ├── BattingTable.jsx       # Batting stats table
│   ├── BowlingTable.jsx       # Bowling stats table
│   ├── FieldingTable.jsx      # Fielding stats table
│   ├── Header.jsx             # Page header
│   ├── HighlightCard.jsx      # Stat highlight card
│   ├── HighlightsSection.jsx  # Highlights container
│   ├── InsightsPanel.jsx      # Insights sidebar
│   ├── OverviewTable.jsx      # Overview stats table
│   ├── TabNavigation.jsx      # Tab switcher
│   └── TableWrapper.jsx       # Table container
│
├── hooks/                      # Custom Hooks (1 file)
│   └── usePlayerStats.js      # Fetch and manage player data
│
├── services/                   # API Layer (1 file)
│   └── playerService.js       # Backend API calls
│
├── utils/                      # Utility Functions (4 files)
│   ├── classNameUtils.js      # CSS class utilities
│   ├── formatUtils.js         # Number formatting
│   ├── playerUtils.js         # Player data processing
│   └── statsCalculations.js   # Statistics calculations
│
├── constants/                  # Configuration (1 file)
│   └── config.js              # App-wide constants
│
├── styles/                     # Stylesheets (1 file)
│   └── main.css               # Global styles
│
├── App.jsx                     # Main component (~100 lines)
├── main.jsx                    # React entry point
│
├── .env                        # Production config
├── .env.local                  # Development config
├── .eslintrc.json              # Linting rules
├── .prettierrc.json            # Formatting rules
├── .gitignore                  # Git ignore list
├── tsconfig.json               # TypeScript config
├── vite.config.js              # Build config
├── package.json                # Dependencies
├── README.md                   # User documentation
└── REFACTORING_SUMMARY.md      # This refactoring overview
```

## Configuration Files

### Environment Variables (.env, .env.local)
```
VITE_API_BASE_URL=<backend-url>
```

### Constants (constants/config.js)
- API_CONFIG: Base URL and endpoints
- TABS: Tab identifiers
- SORT_OPTIONS: Sorting configurations
- MIN_INNINGS_OPTIONS: Filter options
- ROLES: Player role names
- IMPACT_WEIGHTS: Statistical weights
- Thresholds and limits

### Build (vite.config.js)
- React plugin
- Dev server port (5173)

### Code Quality (.eslintrc.json, .prettierrc.json)
- React/Hooks linting
- Code style rules

## Performance Considerations

### Memoization
- `useMemo()` - Caches expensive calculations
  - Stats calculations
  - Derived player lists
  - Insight generation

### Optimizations
- CSS transforms for animations (GPU accelerated)
- Max-height constraint on table container
- Sticky table headers
- Event handlers don't create new functions

### Bundle Size
- Minified: 161 kB
- Gzipped: 50.8 kB
- No unnecessary dependencies

## Dependency Tree

```
react@18.3.1
├── react-dom@18.3.1
│
Development:
├── vite@6.0.0
├── @vitejs/plugin-react@4.0.0
├── eslint@8.50.0
├── eslint-plugin-react@7.33.2
├── eslint-plugin-react-hooks@4.6.0
├── prettier@3.0.3
└── typescript@5.2.0
```

## Error Handling

### API Layer
- Try-catch in usePlayerStats hook
- User-friendly error messages
- Loading state management

### UI Layer
- Conditional rendering based on state
- Graceful fallbacks for missing data
- Null checks in data access

## Future Extensibility

### Ready For:
1. **Testing** - Components are isolated and testable
2. **TypeScript** - Type definitions can be added incrementally
3. **State Management** - Redux/Zustand can be added without refactoring
4. **Code Splitting** - Components can be lazy-loaded
5. **Internationalization** - Constants are centralized
6. **Feature Flags** - Easy to add configuration-based features
7. **Analytics** - Hook lifecycle can integrate tracking
8. **PWA** - Service workers can be added to Vite config

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start dev server (port 5173)
3. Open http://localhost:5173

### Code Quality
1. `npm run lint` - Check code
2. `npm run lint:fix` - Auto-fix issues
3. `npm run format` - Format code

### Production
1. `npm run build` - Build for production
2. `npm run preview` - Preview build locally
3. Deploy `dist/` folder

---

**Architecture Version:** 1.0
**Last Updated:** January 6, 2026
