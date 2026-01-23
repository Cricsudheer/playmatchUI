# Team Join Request - Frontend Engineering Specification

## Document Version: 1.0
**Last Updated:** 2026-01-21
**Status:** Ready for Implementation

---

## Table of Contents
1. [Overview](#overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Data Models](#data-models)
5. [User Workflows & Scenarios](#user-workflows--scenarios)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Validation Rules](#validation-rules)
9. [Edge Cases & Business Rules](#edge-cases--business-rules)
10. [Testing Scenarios](#testing-scenarios)

---

## 1. Overview

### Feature Description
This feature enables players to request to join teams and allows team captains (ADMIN/COORDINATOR roles) to approve or reject these requests.

### Key Behaviors
- **Players** can submit join requests to any team (if not already a member)
- **Captains** (ADMIN/COORDINATOR) can view, approve, or reject pending requests
- **Players** can view their own request history and cancel pending requests
- **Multi-team support**: Users can request to join multiple teams simultaneously
- **Re-request support**: After rejection, users can immediately submit a new request

### User Stories
1. As a player, I want to request to join a team so I can participate in matches
2. As a captain, I want to see pending join requests so I can manage team membership
3. As a captain, I want to approve/reject requests so I can control who joins my team
4. As a player, I want to see my request status so I know if I'm accepted or rejected
5. As a player, I want to cancel my request if I change my mind

---

## 2. User Roles & Permissions

### Role Definitions

| Role | Can Submit Request | Can View Team Requests | Can Approve/Reject | Can Cancel Own Request |
|------|-------------------|------------------------|-------------------|----------------------|
| **PLAYER** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **COORDINATOR** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **ADMIN** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

### Permission Matrix

| Action | Endpoint | Who Can Perform |
|--------|----------|----------------|
| Submit join request | POST /api/teams/{teamId}/join-requests | Any authenticated user |
| View pending requests for team | GET /api/teams/{teamId}/join-requests | Team ADMIN or COORDINATOR |
| Approve request | PUT /api/teams/{teamId}/join-requests/{id}/approve | Team ADMIN or COORDINATOR |
| Reject request | PUT /api/teams/{teamId}/join-requests/{id}/reject | Team ADMIN or COORDINATOR |
| Cancel own request | DELETE /api/teams/join-requests/{id} | Request creator only |
| View own requests | GET /api/teams/join-requests/my-requests | Any authenticated user |

---

## 3. API Endpoints Reference

### Base URL
```
Production: https://api.playmatch.com
Development: http://localhost:8080
```

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

### 3.1 Submit Join Request

**Endpoint:** `POST /api/teams/{teamId}/join-requests`

**Description:** Submit a request to join a team

**Path Parameters:**
- `teamId` (Long, required) - ID of the team to join

**Request Body:**
```json
{
  "message": "I'm a skilled all-rounder looking to join your team"
}
```

**Request Body Schema:**
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| message | string | No | 500 chars | Optional message from player explaining why they want to join |

**Success Response: 201 Created**
```json
{
  "id": 123,
  "teamId": 45,
  "teamName": "Chennai Warriors",
  "userId": 789,
  "userName": null,
  "requestStatus": "PENDING",
  "requestMessage": "I'm a skilled all-rounder looking to join your team",
  "requestedAt": "2026-01-21T10:30:00Z",
  "respondedAt": null,
  "respondedByUserId": null,
  "responseMessage": null
}
```

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 400 | TM-JOIN-400 | User is already a team member | Show message: "You are already a member of this team" |
| 404 | TM-TEAM-404 | Team not found | Show message: "Team not found" |
| 409 | TM-JOIN-409 | Pending request already exists | Show message: "You already have a pending request for this team" |
| 401 | - | Unauthorized | Redirect to login |

**Usage Scenarios:**
- Team discovery page: "Request to Join" button
- Team detail page: Primary action button
- Search results: Quick action on team cards

---

### 3.2 Get Pending Join Requests (Captain View)

**Endpoint:** `GET /api/teams/{teamId}/join-requests`

**Description:** Retrieve all pending join requests for a team (ADMIN/COORDINATOR only)

**Path Parameters:**
- `teamId` (Long, required) - Team ID

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 0 | Page number (0-indexed) |
| size | integer | No | 20 | Number of items per page |

**Success Response: 200 OK**
```json
{
  "content": [
    {
      "id": 123,
      "teamId": 45,
      "teamName": "Chennai Warriors",
      "userId": 789,
      "userName": null,
      "requestStatus": "PENDING",
      "requestMessage": "I'm a skilled all-rounder looking to join your team",
      "requestedAt": "2026-01-21T10:30:00Z",
      "respondedAt": null,
      "respondedByUserId": null,
      "responseMessage": null
    }
  ],
  "totalElements": 15,
  "totalPages": 1,
  "number": 0,
  "size": 20,
  "first": true,
  "last": true,
  "empty": false
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| content | array | Array of join request objects |
| totalElements | integer | Total number of pending requests |
| totalPages | integer | Total number of pages |
| number | integer | Current page number (0-indexed) |
| size | integer | Page size |
| first | boolean | Is this the first page |
| last | boolean | Is this the last page |
| empty | boolean | Is the result empty |

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 403 | TM-AUTH-403 | Insufficient permissions | Show message: "Only team admins/coordinators can view requests" |
| 404 | TM-TEAM-404 | Team not found | Show message: "Team not found" |
| 404 | TM-MEMBER-404 | User not a team member | Show message: "You are not a member of this team" |

**Usage Scenarios:**
- Team management dashboard
- Notifications center
- Team settings page

**Implementation Notes:**
- Requests are sorted by `requestedAt` in descending order (newest first)
- Only shows PENDING requests
- Consider implementing real-time updates (polling every 30s or WebSocket)

---

### 3.3 Approve Join Request

**Endpoint:** `PUT /api/teams/{teamId}/join-requests/{requestId}/approve`

**Description:** Approve a join request and add user as PLAYER member (ADMIN/COORDINATOR only)

**Path Parameters:**
- `teamId` (Long, required) - Team ID
- `requestId` (Long, required) - Join request ID

**Request Body:**
```json
{
  "message": "Welcome to the team! Looking forward to playing with you."
}
```

**Request Body Schema:**
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| message | string | No | 500 chars | Optional welcome message to the player |

**Success Response: 200 OK**
```
(Empty response body)
```

**What Happens on Success:**
1. Request status changes to `APPROVED`
2. User is automatically added as a team member with `PLAYER` role
3. Request is marked with `respondedAt` timestamp and `respondedByUserId`
4. Player can now see the team in their "My Teams" list

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 403 | TM-AUTH-403 | Insufficient permissions | Show message: "Only team admins/coordinators can approve requests" |
| 404 | TM-JOIN-404 | Request not found | Show message: "Request not found or already processed" |
| 400 | TM-JOIN-400 | Request not in PENDING status | Show message: "This request has already been processed" |

**Usage Scenarios:**
- Pending requests list: "Approve" button
- Request detail modal: Primary action
- Bulk actions: Select multiple + approve all

---

### 3.4 Reject Join Request

**Endpoint:** `PUT /api/teams/{teamId}/join-requests/{requestId}/reject`

**Description:** Reject a join request (ADMIN/COORDINATOR only)

**Path Parameters:**
- `teamId` (Long, required) - Team ID
- `requestId` (Long, required) - Join request ID

**Request Body:**
```json
{
  "message": "Thank you for your interest. We're currently looking for bowlers only."
}
```

**Request Body Schema:**
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| message | string | No | 500 chars | Optional reason for rejection (recommended for better UX) |

**Success Response: 200 OK**
```
(Empty response body)
```

**What Happens on Success:**
1. Request status changes to `REJECTED`
2. Request is soft-deleted (hidden from captain's view)
3. Request is marked with `respondedAt` timestamp and `respondedByUserId`
4. User can immediately submit a new request to the same team (no cooldown)

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 403 | TM-AUTH-403 | Insufficient permissions | Show message: "Only team admins/coordinators can reject requests" |
| 404 | TM-JOIN-404 | Request not found | Show message: "Request not found or already processed" |
| 400 | TM-JOIN-400 | Request not in PENDING status | Show message: "This request has already been processed" |

**Usage Scenarios:**
- Pending requests list: "Reject" button
- Request detail modal: Secondary/destructive action
- Bulk actions: Select multiple + reject all

**Important Notes:**
- **Rejected requests are NOT shown to the player** in their request history
- Player won't know they were rejected unless captain provides a response message via another channel
- Consider providing a reason in the `message` field for transparency (though player won't see it in this MVP)

---

### 3.5 Cancel Join Request

**Endpoint:** `DELETE /api/teams/join-requests/{requestId}`

**Description:** Cancel own pending join request

**Path Parameters:**
- `requestId` (Long, required) - Join request ID

**Request Body:** None

**Success Response: 204 No Content**
```
(Empty response body)
```

**What Happens on Success:**
1. Request status changes to `CANCELLED`
2. Request is soft-deleted (hidden from captain's view)
3. User can submit a new request to the same team

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 403 | TM-AUTH-403 | Not your request | Show message: "You can only cancel your own requests" |
| 404 | TM-JOIN-404 | Request not found | Show message: "Request not found" |
| 400 | TM-JOIN-400 | Request not in PENDING status | Show message: "Can only cancel pending requests" |

**Usage Scenarios:**
- My requests page: "Cancel" button next to pending requests
- Confirmation modal before deletion

---

### 3.6 Get My Join Requests

**Endpoint:** `GET /api/teams/join-requests/my-requests`

**Description:** Retrieve all join requests submitted by current user across all teams

**Query Parameters:** None

**Success Response: 200 OK**
```json
[
  {
    "id": 123,
    "teamId": 45,
    "teamName": "Chennai Warriors",
    "userId": 789,
    "userName": null,
    "requestStatus": "PENDING",
    "requestMessage": "I'm a skilled all-rounder looking to join your team",
    "requestedAt": "2026-01-21T10:30:00Z",
    "respondedAt": null,
    "respondedByUserId": null,
    "responseMessage": null
  },
  {
    "id": 124,
    "teamId": 46,
    "teamName": "Mumbai Mavericks",
    "userId": 789,
    "userName": null,
    "requestStatus": "APPROVED",
    "requestMessage": "Looking to play as a bowler",
    "requestedAt": "2026-01-20T14:15:00Z",
    "respondedAt": "2026-01-20T16:45:00Z",
    "respondedByUserId": 101,
    "responseMessage": "Welcome to the team!"
  },
  {
    "id": 125,
    "teamId": 47,
    "teamName": "Delhi Daredevils",
    "userId": 789,
    "userName": null,
    "requestStatus": "CANCELLED",
    "requestMessage": null,
    "requestedAt": "2026-01-19T09:00:00Z",
    "respondedAt": "2026-01-19T10:30:00Z",
    "respondedByUserId": null,
    "responseMessage": null
  }
]
```

**Response Characteristics:**
- Returns array sorted by `requestedAt` descending (newest first)
- **IMPORTANT:** Excludes `REJECTED` requests (user never sees rejections)
- Includes: `PENDING`, `APPROVED`, `CANCELLED` statuses only
- May return empty array if user has no requests

**Error Responses:**

| Status | Error Code | Description | User Action |
|--------|-----------|-------------|-------------|
| 401 | - | Unauthorized | Redirect to login |

**Usage Scenarios:**
- Profile page: "My Join Requests" section
- Dashboard: Quick view of pending requests
- Notifications: Count of pending requests

---

## 4. Data Models

### 4.1 TeamJoinRequestResponse

```typescript
interface TeamJoinRequestResponse {
  id: number;                          // Unique request ID
  teamId: number;                      // ID of the team
  teamName: string;                    // Name of the team
  userId: number;                      // ID of the requesting user
  userName: string | null;             // Name of the requesting user (may be null)
  requestStatus: RequestStatus;        // Current status
  requestMessage: string | null;       // Player's message (max 500 chars)
  requestedAt: string;                 // ISO 8601 timestamp (e.g., "2026-01-21T10:30:00Z")
  respondedAt: string | null;          // When captain responded or user cancelled
  respondedByUserId: number | null;    // User ID of captain who responded
  responseMessage: string | null;      // Captain's response message (max 500 chars)
}

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
```

### 4.2 JoinRequestPageResponse

```typescript
interface JoinRequestPageResponse {
  content: TeamJoinRequestResponse[];  // Array of requests
  totalElements: number;               // Total count across all pages
  totalPages: number;                  // Total number of pages
  number: number;                      // Current page number (0-indexed)
  size: number;                        // Page size
  first: boolean;                      // Is this the first page
  last: boolean;                       // Is this the last page
  empty: boolean;                      // Is content empty
}
```

### 4.3 Error Response

```typescript
interface ErrorResponse {
  code: string;        // Error code (e.g., "TM-JOIN-409")
  title: string;       // Human-readable error title
  status: number;      // HTTP status code
  detail?: string;     // Additional error details
  instance?: string;   // Request identifier
}
```

---

## 5. User Workflows & Scenarios

### 5.1 Player Workflow: Submit Join Request

**Preconditions:**
- User is authenticated
- User is viewing a team they are NOT a member of
- User does NOT have a pending request for this team

**Steps:**
1. User clicks "Request to Join" button/link
2. System checks if user is already a member → Show error if yes
3. System checks if pending request exists → Show error if yes
4. Optional: Show modal/form to enter a message
5. User enters message (optional) and clicks "Submit"
6. Call `POST /api/teams/{teamId}/join-requests`
7. On success:
   - Show success message: "Join request submitted successfully!"
   - Update button state to "Request Pending" (disabled)
   - Optionally redirect to "My Requests" page
8. On error:
   - Show appropriate error message based on error code

**State Changes:**
- Button text: "Request to Join" → "Request Pending"
- Button state: Enabled → Disabled
- Request appears in user's "My Requests" list with PENDING status

---

### 5.2 Player Workflow: View Request Status

**Preconditions:**
- User is authenticated

**Steps:**
1. User navigates to profile/dashboard
2. Call `GET /api/teams/join-requests/my-requests`
3. Display requests grouped by status:
   - **Pending Requests** (show "Cancel" action)
   - **Approved Requests** (show checkmark, optional response message)
   - **Cancelled Requests** (show as historical record)
4. For each request, display:
   - Team name (clickable link)
   - Status badge (color-coded)
   - Requested date (formatted, e.g., "2 days ago")
   - User's message (if provided)
   - Response message (if approved)

**Important Notes:**
- **REJECTED requests will NOT appear** in this list
- Consider auto-refreshing this list periodically (e.g., every 30 seconds)
- Show empty state if no requests

---

### 5.3 Player Workflow: Cancel Request

**Preconditions:**
- User has a PENDING request

**Steps:**
1. User clicks "Cancel" button next to a pending request
2. Show confirmation dialog: "Are you sure you want to cancel this request?"
3. User confirms
4. Call `DELETE /api/teams/join-requests/{requestId}`
5. On success:
   - Remove request from list or update status to CANCELLED
   - Show success message: "Request cancelled successfully"
   - Enable "Request to Join" button if user is viewing that team page
6. On error:
   - Show error message based on error code

**State Changes:**
- Request status: PENDING → CANCELLED
- Request removed from captain's pending list
- User can submit new request to same team

---

### 5.4 Captain Workflow: View Pending Requests

**Preconditions:**
- User is ADMIN or COORDINATOR of the team

**Steps:**
1. User navigates to team management or notifications
2. Call `GET /api/teams/{teamId}/join-requests?page=0&size=20`
3. Display list of pending requests showing:
   - Requester's name
   - Request date (e.g., "3 hours ago")
   - Request message (if provided)
   - Actions: "Approve" and "Reject" buttons
4. If no requests:
   - Show empty state: "No pending join requests"

**Implementation Considerations:**
- Implement pagination if more than 20 requests
- Consider showing a count badge (e.g., "Join Requests (5)")
- Sort by newest first (default from backend)
- Optionally poll for updates every 30 seconds

---

### 5.5 Captain Workflow: Approve Request

**Preconditions:**
- User is ADMIN or COORDINATOR of the team
- Request status is PENDING

**Steps:**
1. User clicks "Approve" button for a request
2. Optional: Show dialog to enter welcome message
3. User enters message (optional) and confirms
4. Call `PUT /api/teams/{teamId}/join-requests/{requestId}/approve`
5. On success:
   - Show success message: "{PlayerName} has been added to the team!"
   - Remove request from pending list
   - Increment team member count
   - Optionally show new member in team members list
6. On error:
   - Show error message
   - If already processed, refresh the list

**State Changes:**
- Request status: PENDING → APPROVED
- Request disappears from captain's pending list
- New member appears in team members list with PLAYER role
- Player sees status change to APPROVED in their requests list

---

### 5.6 Captain Workflow: Reject Request

**Preconditions:**
- User is ADMIN or COORDINATOR of the team
- Request status is PENDING

**Steps:**
1. User clicks "Reject" button for a request
2. Optional: Show dialog to enter rejection reason
3. User enters reason (optional, not shown to player in MVP) and confirms
4. Show confirmation: "Are you sure you want to reject this request?"
5. User confirms
6. Call `PUT /api/teams/{teamId}/join-requests/{requestId}/reject`
7. On success:
   - Show success message: "Request rejected"
   - Remove request from pending list
8. On error:
   - Show error message
   - If already processed, refresh the list

**State Changes:**
- Request status: PENDING → REJECTED
- Request disappears from captain's pending list
- Request does NOT appear in player's request history
- Player can submit new request immediately

---

### 5.7 Concurrent Request Scenario (Multi-Team)

**Scenario:** User wants to join multiple teams

**Steps:**
1. User submits request to Team A
2. User submits request to Team B
3. User submits request to Team C
4. All three requests are PENDING simultaneously
5. Team A approves → User becomes member of Team A
6. Requests to Team B and Team C remain PENDING
7. User can still get approved by Team B and Team C

**Key Points:**
- Users can have unlimited pending requests
- Approval to one team does NOT cancel other requests
- Users can be members of multiple teams simultaneously

---

## 6. State Management

### 6.1 Request Status State Machine

```
[NEW USER] → Submit Request → [PENDING]
                                  ↓
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
              [APPROVED]     [REJECTED]    [CANCELLED]
                    ↓             ↓             ↓
           (User added    (User can      (User can
            to team)      re-request)    re-request)
```

**State Transitions:**

| From State | Action | To State | Who Can Trigger | Side Effects |
|------------|--------|----------|----------------|--------------|
| - | Submit Request | PENDING | Player | Request created |
| PENDING | Approve | APPROVED | ADMIN/COORDINATOR | User added as PLAYER member |
| PENDING | Reject | REJECTED | ADMIN/COORDINATOR | Request soft-deleted, hidden from player |
| PENDING | Cancel | CANCELLED | Request creator | Request soft-deleted |
| APPROVED | - | - | - | Terminal state |
| REJECTED | - | - | - | Terminal state (hidden from player) |
| CANCELLED | - | - | - | Terminal state |

### 6.2 Button State Management

**For "Request to Join" Button:**

| Condition | Button Text | State | Behavior |
|-----------|------------|-------|----------|
| User not a member, no pending request | "Request to Join" | Enabled | Opens request form |
| User not a member, pending request exists | "Request Pending" | Disabled | Shows tooltip: "You already have a pending request" |
| User is a member | "Member" | Disabled | - |
| User not authenticated | "Login to Join" | Enabled | Redirects to login |

**For Request Actions (Player View):**

| Request Status | Cancel Action | Notes |
|---------------|---------------|-------|
| PENDING | Enabled | Shows "Cancel Request" button |
| APPROVED | Disabled/Hidden | Shows checkmark instead |
| CANCELLED | Disabled/Hidden | Shows "Cancelled" label |

**For Request Actions (Captain View):**

| Request Status | Approve Action | Reject Action |
|---------------|----------------|---------------|
| PENDING | Enabled | Enabled |
| APPROVED/REJECTED/CANCELLED | Hidden | Hidden |

---

## 7. Error Handling

### 7.1 Error Codes Reference

| Error Code | HTTP Status | Scenario | User-Friendly Message | Recommended Action |
|------------|-------------|----------|---------------------|-------------------|
| TM-TEAM-404 | 404 | Team not found | "This team no longer exists" | Redirect to teams list |
| TM-JOIN-409 | 409 | Duplicate pending request | "You already have a pending request for this team" | Disable submit button |
| TM-JOIN-400 | 400 | Already a member | "You are already a member of this team" | Show "Member" badge |
| TM-JOIN-404 | 404 | Request not found | "This request no longer exists" | Refresh the list |
| TM-AUTH-403 | 403 | Insufficient permissions | "Only team admins and coordinators can perform this action" | Hide action buttons |
| TM-MEMBER-404 | 404 | User not a team member | "You are not a member of this team" | Redirect to team page |
| TM-JOIN-400 | 400 | Invalid status transition | "This request has already been processed" | Refresh the list |

### 7.2 Network Error Handling

```typescript
// Example error handling
try {
  await submitJoinRequest(teamId, message);
  showSuccess("Request submitted successfully!");
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { code, title } = error.response.data;
    switch (code) {
      case 'TM-JOIN-409':
        showError("You already have a pending request for this team");
        break;
      case 'TM-JOIN-400':
        showError("You are already a member of this team");
        break;
      default:
        showError(title || "Failed to submit request");
    }
  } else if (error.request) {
    // Network error
    showError("Network error. Please check your connection and try again");
  } else {
    showError("An unexpected error occurred");
  }
}
```

### 7.3 Retry Logic

**Recommended Retry Strategy:**
- GET requests: Retry up to 3 times with exponential backoff
- POST/PUT/DELETE: Do NOT auto-retry (user should manually retry)
- Network timeout: 30 seconds for all requests

---

## 8. Validation Rules

### 8.1 Client-Side Validation

**Request Message Field:**
- Max length: 500 characters
- Optional field
- Show character counter: "123/500"
- Trim whitespace before submission

**Response Message Field (Captain):**
- Max length: 500 characters
- Optional field
- Show character counter

### 8.2 State Validation

**Before Submit Request:**
```typescript
function canSubmitRequest(team, currentUser, existingRequest) {
  if (!currentUser.isAuthenticated) {
    return { allowed: false, reason: "Please login to join teams" };
  }
  if (team.members.some(m => m.userId === currentUser.id)) {
    return { allowed: false, reason: "You are already a member" };
  }
  if (existingRequest && existingRequest.status === 'PENDING') {
    return { allowed: false, reason: "You already have a pending request" };
  }
  return { allowed: true };
}
```

**Before Cancel Request:**
```typescript
function canCancelRequest(request, currentUser) {
  if (request.userId !== currentUser.id) {
    return { allowed: false, reason: "Not your request" };
  }
  if (request.status !== 'PENDING') {
    return { allowed: false, reason: "Only pending requests can be cancelled" };
  }
  return { allowed: true };
}
```

**Before Approve/Reject:**
```typescript
function canManageRequests(team, currentUser) {
  const member = team.members.find(m => m.userId === currentUser.id);
  if (!member) {
    return { allowed: false, reason: "Not a team member" };
  }
  if (member.role === 'PLAYER') {
    return { allowed: false, reason: "Only admins and coordinators can manage requests" };
  }
  return { allowed: true };
}
```

---

## 9. Edge Cases & Business Rules

### 9.1 Duplicate Request Prevention

**Scenario:** User tries to submit request while one is pending

**Backend Behavior:**
- Returns 409 Conflict with error code `TM-JOIN-409`

**Frontend Handling:**
1. Check for existing pending request before showing submit form
2. If pending request exists, disable "Request to Join" button
3. Show status: "Request Pending"
4. If user somehow bypasses and submits, handle 409 error gracefully

---

### 9.2 Already Member Check

**Scenario:** User tries to join a team they're already in

**Backend Behavior:**
- Returns 400 Bad Request with error code `TM-JOIN-400`

**Frontend Handling:**
1. Check team membership before showing "Request to Join" button
2. If user is member, show "Member" badge instead
3. If user somehow submits, handle 400 error gracefully

---

### 9.3 Concurrent Approval/Rejection

**Scenario:** Two admins try to approve/reject the same request simultaneously

**Backend Behavior:**
- First request succeeds
- Second request receives 404 (request soft-deleted) or 400 (status already changed)

**Frontend Handling:**
1. After successful approve/reject, immediately remove from UI
2. If error occurs, refresh the pending requests list
3. Show message: "This request has already been processed"

---

### 9.4 Request During Approval

**Scenario:** User cancels request while captain is approving it

**Backend Behavior:**
- Whichever request reaches server first wins
- Other request receives 400 or 404 error

**Frontend Handling:**
- Handle gracefully with appropriate error message
- Refresh relevant lists

---

### 9.5 Re-request After Rejection

**Scenario:** User wants to request same team after being rejected

**Backend Behavior:**
- Rejected request is soft-deleted (is_active=false)
- User can immediately submit a new request
- No cooldown period

**Frontend Handling:**
1. Rejected requests are NOT shown in user's history
2. "Request to Join" button remains enabled
3. User can submit new request immediately

---

### 9.6 Multiple Pending Requests

**Scenario:** User has pending requests to multiple teams

**Backend Behavior:**
- Unlimited concurrent pending requests allowed
- Each request is independent
- Approval to one team doesn't affect others

**Frontend Handling:**
1. Show all pending requests in "My Requests" section
2. Allow cancellation of individual requests
3. Show which teams have pending, approved, or cancelled requests

---

### 9.7 Team Deletion

**Scenario:** Team is deleted while user has pending request

**Backend Behavior:**
- Cascade delete removes all join requests for that team
- Foreign key constraint handles cleanup

**Frontend Handling:**
1. When viewing team page, show "Team not found" if deleted
2. In "My Requests" list, handle gracefully if team lookup fails
3. Consider polling or refresh to update deleted teams

---

### 9.8 User Account Deletion

**Scenario:** Requester deletes their account

**Backend Behavior:**
- Cascade delete removes all their join requests
- Pending requests disappear from captain's view

**Frontend Handling:**
- No special handling needed (user is logged out)

---

### 9.9 Role Demotion During Review

**Scenario:** Admin reviewing requests gets demoted to PLAYER

**Backend Behavior:**
- If admin tries to approve/reject after demotion, receives 403 Forbidden

**Frontend Handling:**
1. After any role change, refresh user's team data
2. Hide approve/reject buttons for PLAYER role
3. Handle 403 error gracefully: "You no longer have permission"

---

### 9.10 Request Expiration (Future)

**Note:** Auto-expiry is NOT implemented in MVP, but may be added later

**Future Behavior:**
- Requests older than 14 days will auto-expire to CANCELLED
- No warning notification before expiry

**Frontend Preparation:**
- Design UI to handle CANCELLED status gracefully
- Consider showing age of pending requests

---

## 10. Testing Scenarios

### 10.1 Player Tests

**Happy Path:**
1. ✅ Submit join request with message
2. ✅ Submit join request without message
3. ✅ View own pending requests
4. ✅ View approved requests with response message
5. ✅ Cancel pending request
6. ✅ Submit new request to same team after cancellation

**Error Cases:**
1. ✅ Try to submit duplicate request → Show error
2. ✅ Try to join team already a member of → Show error
3. ✅ Try to cancel already processed request → Show error
4. ✅ Try to cancel someone else's request → Show error

**Edge Cases:**
1. ✅ Submit requests to 5 different teams simultaneously
2. ✅ Cancel one request while others remain pending
3. ✅ Get approved to one team, others still pending
4. ✅ Character limit validation on message field

---

### 10.2 Captain Tests

**Happy Path:**
1. ✅ View list of pending requests
2. ✅ Approve request with welcome message
3. ✅ Approve request without message
4. ✅ Reject request with reason
5. ✅ Verify approved user appears in team members
6. ✅ Verify rejected request disappears from list

**Error Cases:**
1. ✅ Try to approve as PLAYER → Show error
2. ✅ Try to approve already processed request → Show error
3. ✅ Try to reject already processed request → Show error

**Edge Cases:**
1. ✅ Approve multiple requests in quick succession
2. ✅ View requests with pagination (if >20)
3. ✅ Approve request that was concurrently cancelled

---

### 10.3 Integration Tests

**Workflow Tests:**
1. ✅ End-to-end: Player submits → Captain approves → Player becomes member
2. ✅ End-to-end: Player submits → Captain rejects → Player re-requests → Captain approves
3. ✅ Multi-team: Player requests 3 teams → All 3 approve → Player is member of 3 teams
4. ✅ Cancellation: Player submits → Player cancels → Player re-requests
5. ✅ Permission: PLAYER promoted to COORDINATOR → Can now approve requests
6. ✅ Permission: COORDINATOR demoted to PLAYER → Cannot approve requests

---

### 10.4 UI/UX Tests

**Visual Tests:**
1. ✅ Pending request badge shows correctly
2. ✅ Approved request shows checkmark
3. ✅ Cancelled request shows appropriate state
4. ✅ Empty state for no requests
5. ✅ Loading states during API calls
6. ✅ Error messages are clear and actionable

**Accessibility Tests:**
1. ✅ Buttons have proper ARIA labels
2. ✅ Status badges are screen-reader friendly
3. ✅ Keyboard navigation works
4. ✅ Focus management in modals

---

## 11. Implementation Checklist

### Phase 1: Core API Integration
- [ ] Create TypeScript interfaces for all data models
- [ ] Implement API service functions for all 6 endpoints
- [ ] Add JWT token to all requests
- [ ] Implement error handling with proper error codes
- [ ] Add request/response logging for debugging

### Phase 2: Player Features
- [ ] "Request to Join" button with state management
- [ ] Request submission form/modal with message field
- [ ] "My Requests" list component
- [ ] Cancel request functionality with confirmation
- [ ] Status badges for PENDING/APPROVED/CANCELLED
- [ ] Empty states for no requests

### Phase 3: Captain Features
- [ ] Pending requests list view
- [ ] Approve request with optional message
- [ ] Reject request with optional reason
- [ ] Permission checks (hide from PLAYER role)
- [ ] Pagination for large request lists
- [ ] Request count badge

### Phase 4: State Management
- [ ] Global state for current user's requests
- [ ] Local state for team's pending requests
- [ ] Cache invalidation on approve/reject/cancel
- [ ] Optimistic UI updates

### Phase 5: Error Handling
- [ ] Error message components
- [ ] Toast notifications for success/error
- [ ] Network error handling
- [ ] Retry logic for GET requests
- [ ] Form validation with error display

### Phase 6: Polish & Testing
- [ ] Loading states for all async operations
- [ ] Skeleton screens for lists
- [ ] Success animations/confirmations
- [ ] Accessibility audit (ARIA, keyboard nav)
- [ ] Mobile responsiveness
- [ ] Unit tests for business logic
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths

---

## 12. API Client Example (TypeScript)

```typescript
import axios, { AxiosInstance } from 'axios';

class TeamJoinRequestService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to all requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Submit a join request to a team
   */
  async submitJoinRequest(
    teamId: number,
    message?: string
  ): Promise<TeamJoinRequestResponse> {
    const response = await this.api.post(
      `/api/teams/${teamId}/join-requests`,
      { message }
    );
    return response.data;
  }

  /**
   * Get pending join requests for a team (ADMIN/COORDINATOR only)
   */
  async getPendingRequests(
    teamId: number,
    page = 0,
    size = 20
  ): Promise<JoinRequestPageResponse> {
    const response = await this.api.get(
      `/api/teams/${teamId}/join-requests`,
      { params: { page, size } }
    );
    return response.data;
  }

  /**
   * Approve a join request
   */
  async approveRequest(
    teamId: number,
    requestId: number,
    message?: string
  ): Promise<void> {
    await this.api.put(
      `/api/teams/${teamId}/join-requests/${requestId}/approve`,
      { message }
    );
  }

  /**
   * Reject a join request
   */
  async rejectRequest(
    teamId: number,
    requestId: number,
    message?: string
  ): Promise<void> {
    await this.api.put(
      `/api/teams/${teamId}/join-requests/${requestId}/reject`,
      { message }
    );
  }

  /**
   * Cancel own join request
   */
  async cancelRequest(requestId: number): Promise<void> {
    await this.api.delete(`/api/teams/join-requests/${requestId}`);
  }

  /**
   * Get current user's join requests
   */
  async getMyRequests(): Promise<TeamJoinRequestResponse[]> {
    const response = await this.api.get('/api/teams/join-requests/my-requests');
    return response.data;
  }
}

export default TeamJoinRequestService;
```

---

## 13. Quick Reference: Common Scenarios

| Scenario | Endpoint | Method | Requester Role | Expected Result |
|----------|----------|--------|---------------|-----------------|
| Player wants to join team | `/api/teams/{id}/join-requests` | POST | Any | Request created with PENDING status |
| Captain checks new requests | `/api/teams/{id}/join-requests` | GET | ADMIN/COORD | List of pending requests |
| Captain accepts player | `/api/teams/{id}/join-requests/{id}/approve` | PUT | ADMIN/COORD | Player added as PLAYER member |
| Captain rejects player | `/api/teams/{id}/join-requests/{id}/reject` | PUT | ADMIN/COORD | Request hidden from both parties |
| Player changes mind | `/api/teams/join-requests/{id}` | DELETE | Requester | Request cancelled, can re-request |
| Player checks status | `/api/teams/join-requests/my-requests` | GET | Any | List of own requests (excludes REJECTED) |

---

## 14. Contact & Support

**For Backend Questions:**
- API Documentation: `http://localhost:8080/swagger-ui.html`
- Backend Spec: `docs/TEAM_JOIN_REQUEST_BACKEND.md`

**For Clarifications:**
- Detailed Design: `docs/TEAM_JOIN_REQUEST_REFINED_DESIGN.md`
- Implementation Summary: `docs/TEAM_JOIN_REQUEST_IMPLEMENTATION_SUMMARY.md`

---

**Document End**
