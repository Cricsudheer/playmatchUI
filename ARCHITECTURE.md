# GameTeam MVP - Architecture Documentation

## Project Overview

GameTeam MVP is a mobile-first React application for cricket match organization - the "Match Survival OS" for cricket captains. It provides a streamlined flow for creating matches, managing invites, tracking player responses, and handling payments.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (React Components - src/mvp/components/)                    │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
    ┌────────▼────────┐                 ┌────────▼────────┐
    │   UI Components │                 │  Feature        │
    │ ─────────────── │                 │  Components     │
    │ • Button        │                 │ ─────────────── │
    │ • Input         │                 │ • MatchCard     │
    │ • Modal         │                 │ • PlayerList    │
    │ • Badge         │                 │ • CountdownTimer│
    │ • Skeleton      │                 │ • OtpAuth       │
    └────────┬────────┘                 └────────┬────────┘
             │                                    │
             └─────────────┬──────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      PAGES LAYER                             │
│  (src/mvp/pages/)                                           │
├─────────────────────────────────────────────────────────────┤
│  • HomePage           - Dashboard with match list            │
│  • CreateMatchPage    - New match creation flow              │
│  • MatchControlPage   - Match management (THE KEY SCREEN)    │
│  • TeamInvitePage     - Team invite response (/m/:token)     │
│  • EmergencyInvitePage- Emergency request (/e/:token)        │
│  • PaymentTrackingPage- Payment management                   │
│  • EmergencyApprovalPage - Approve/reject emergency requests │
│  • ProfilePage        - User profile management              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    LOGIC LAYER                               │
│  (Hooks - src/mvp/hooks/)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • useMvpAuth      - Auth state management                   │
│  • useOtpAuth      - OTP flow handling                       │
│  • useMatch        - Single match data                       │
│  • useMyMatches    - User's matches list                     │
│  • useMatchMutations - Create/respond/backout                │
│  • useEmergency    - Emergency request handling              │
│  • usePayments     - Payment tracking                        │
│  • useCountdown    - Timer management                        │
│  • usePageTitle    - Document title                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  DATA & SERVICES LAYER                       │
│  (src/mvp/services/, src/mvp/constants/)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API Service (api.js)    │  Constants (index.js)            │
│  ────────────────────    │  ────────────────────            │
│  • apiFetch (auth)       │  • EVENT_TYPES                   │
│  • publicFetch (no auth) │  • MATCH_STATUS                  │
│  • sendOtp, verifyOtp    │  • PARTICIPANT_STATUS            │
│  • getMyGames            │  • EMERGENCY_REQUEST_STATUS      │
│  • createMatch           │  • PAYMENT_STATUS                │
│  • respondToMatch        │  • BACKOUT_REASONS               │
│  • logBackout            │  • MVP_ENDPOINTS                 │
│  • getPaymentTracking    │  • API_CONFIG                    │
│  • markPayment           │  • Storage keys                  │
│  • Emergency operations  │                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── App.jsx              # Main app with routes
├── main.jsx             # React entry point
├── index.css            # Global styles (Tailwind + CSS variables)
└── mvp/
    ├── components/      # Reusable UI components
    │   ├── Badge.jsx
    │   ├── Button.jsx
    │   ├── CountdownTimer.jsx
    │   ├── ErrorState.jsx
    │   ├── Input.jsx
    │   ├── MatchCard.jsx
    │   ├── Modal.jsx
    │   ├── MvpProtectedRoute.jsx
    │   ├── OtpAuth.jsx
    │   ├── PlayerList.jsx
    │   ├── Skeleton.jsx
    │   ├── BackoutReasonModal.jsx
    │   └── index.js     # Barrel exports
    ├── constants/
    │   └── index.js     # All MVP constants & endpoints
    ├── hooks/
    │   ├── useMatch.js
    │   ├── useMvpAuth.js
    │   ├── useOtpAuth.js
    │   ├── useCountdown.js
    │   ├── usePageTitle.js
    │   └── index.js     # Barrel exports
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── CreateMatchPage.jsx
    │   ├── MatchControlPage.jsx
    │   ├── TeamInvitePage.jsx
    │   ├── EmergencyInvitePage.jsx
    │   ├── PaymentTrackingPage.jsx
    │   ├── EmergencyApprovalPage.jsx
    │   ├── ProfilePage.jsx
    │   └── index.js     # Barrel exports
    ├── services/
    │   └── api.js       # API service with RFC 7807 error handling
    ├── styles/
    │   └── mvp.css      # MVP-specific styles
    └── utils/
        ├── matchUtils.js  # Match helper functions
        └── timerUtils.js  # Timer/countdown utilities
```

## Key Architectural Decisions

### 1. Phone-Based OTP Authentication
- No email/password - just phone + OTP
- JWT tokens stored in localStorage
- Refresh token support for session persistence

### 2. Role Derivation Per Match
- No global user roles
- Captain = match creator
- Participant = user who responded YES
- Visitor = not associated with match

### 3. Mobile-First Design
- Single primary CTA per screen
- Bottom sheets for mobile actions
- Touch-friendly tap targets

### 4. Error Handling (RFC 7807)
- Structured error responses: `{ code, title, status, detail }`
- User-friendly error messages
- Automatic token refresh on 401

### 5. State Management
- React useState/useEffect (no Redux needed)
- Custom hooks for data fetching
- localStorage for auth persistence

## Routes

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/home` | HomePage | No | Landing/Dashboard |
| `/m/:token` | TeamInvitePage | No | Team invite link |
| `/e/:token` | EmergencyInvitePage | No | Emergency invite link |
| `/matches/new` | CreateMatchPage | Yes | Create match |
| `/matches/:id` | MatchControlPage | Yes | Match control |
| `/matches/:id/payments` | PaymentTrackingPage | Yes | Payment tracking |
| `/matches/:id/emergency` | EmergencyApprovalPage | Yes | Emergency approvals |
| `/profile` | ProfilePage | Yes | User profile |

## Tech Stack

- **Framework:** React 18
- **Build:** Vite 6
- **Styling:** Tailwind CSS 4
- **Forms:** react-hook-form + zod
- **Routing:** react-router-dom 6
- **Toasts:** sonner
- **Date:** date-fns
