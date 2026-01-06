# SIGMA Cricket Team Dashboard

A modern React application for displaying cricket team statistics and player performance metrics with real-time data synchronization.

## Features

- **Team Overview**: Combined view of batting, bowling, and fielding stats
- **Batting Analysis**: Detailed batting statistics with filtering and sorting options
- **Bowling Analysis**: Wicket-taking ability and economy rate metrics
- **Fielding Stats**: Dismissal tracking and fielder performance
- **Auto-Generated Insights**: AI-derived recommendations for team selection
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern, eye-friendly interface with gradient accents

## Project Structure

```
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # API calls and data fetching
├── utils/            # Utility functions and helpers
├── constants/        # Application constants and config
├── styles/           # Global CSS styles
├── App.jsx           # Main application component
├── main.jsx          # React entry point
└── index.css         # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sigma_dashboard_react
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
# .env (production)
VITE_API_BASE_URL=https://playmatch-preprod.onrender.com

# .env.local (development)
VITE_API_BASE_URL=http://localhost:8080
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Create an optimized production build:
```bash
npm run build
```

### Linting & Formatting

Check code quality:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## Architecture & Best Practices

### Component Organization
- Small, focused components with single responsibility
- Proper prop drilling with context when needed
- Functional components with React Hooks

### State Management
- Local component state for UI state
- Custom hooks for shared logic
- `useMemo` for expensive calculations

### Separation of Concerns
- **Components**: UI rendering only
- **Hooks**: State and side effects logic
- **Services**: API calls and backend communication
- **Utils**: Pure functions and helpers
- **Constants**: Centralized config values

### Code Quality
- ESLint configuration for code consistency
- Prettier for code formatting
- TypeScript support ready (optional)

## API Integration

The application fetches cricket statistics from the SIGMA backend API:

```
GET /sigma/api/players/all/stats
```

### Response Format

```json
[
  {
    "playerId": "string",
    "playerName": "string",
    "battingStats": {
      "innings": number,
      "runsScored": number,
      "averageScore": number
    },
    "bowlingStats": {
      "innings": number,
      "wicketsTaken": number,
      "economyRate": number
    },
    "dismissalStats": {
      "innings": number,
      "dismissals": number
    }
  }
]
```

## Technologies Used

- **React 18.3+**: UI library
- **Vite**: Build tool and dev server
- **CSS3**: Styling with CSS variables
- **ESLint**: Code quality
- **Prettier**: Code formatting

## Performance Optimizations

- Memoized calculations using `useMemo`
- Lazy table scrolling (max-height constraint)
- Efficient re-rendering with proper dependency arrays
- CSS transitions for smooth animations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- Mobile browsers

## Contributing

1. Follow the existing code structure
2. Use meaningful commit messages
3. Run `npm run lint:fix` before committing
4. Update documentation for new features

## License

Proprietary - SIGMA Cricket Team
