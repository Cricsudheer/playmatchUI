# GameTeam MVP

A mobile-first React application for cricket match organization - the "Match Survival OS" for cricket captains. Create matches, share invite links, track player responses, and manage payments all in one place.

## Features

- **OTP Authentication**: Phone-based login with no passwords to remember
- **Match Creation**: Create matches with venue, time, fees, and player limits
- **Invite Links**: Shareable links for team invites and emergency slots
- **Player Management**: Track confirmed players, backups, and backouts
- **Emergency Slots**: 60-minute lock system for last-minute player additions
- **Payment Tracking**: Mark and track player payments with UPI/Cash options
- **Real-time Status**: Match health indicators (Safe/Risk/Critical)
- **Mobile-First Design**: Touch-friendly UI optimized for on-the-go use

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Forms**: react-hook-form + zod
- **Routing**: react-router-dom 6
- **Notifications**: sonner
- **Date Handling**: date-fns

## Project Structure

```
src/
├── App.jsx           # Main app with routes
├── main.jsx          # React entry point
├── index.css         # Global styles
└── mvp/
    ├── components/   # Reusable UI components
    ├── constants/    # App constants & API endpoints
    ├── hooks/        # Custom React hooks
    ├── pages/        # Page components
    ├── services/     # API service
    ├── styles/       # MVP-specific CSS
    └── utils/        # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playMatchUI
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables (optional):
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Create production build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Routes

| Route | Description |
|-------|-------------|
| `/home` | Landing page / Dashboard |
| `/m/:token` | Team invite link |
| `/e/:token` | Emergency invite link |
| `/matches/new` | Create new match |
| `/matches/:id` | Match control dashboard |
| `/matches/:id/payments` | Payment tracking |
| `/matches/:id/emergency` | Emergency approvals |
| `/profile` | User profile |

## API Documentation

See [FRONTEND.md](./FRONTEND.md) for complete API specification.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## License

Private - All rights reserved.
