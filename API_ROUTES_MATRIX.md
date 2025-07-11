# API Routes Audit Matrix

## Current Status Overview

| Component | Endpoint Called | Expected Route | Current Server Route | Status | Notes |
|-----------|----------------|----------------|----------------------|--------|-------|
| **Authentication Routes** |
| Login.js | `/api/auth/login` | `/api/auth/login` | `/api/auth/login` | ✅ MATCH | Working correctly |
| Register.js | `/api/auth/register` | `/api/auth/register` | `/api/auth/register` | ✅ MATCH | Working correctly |
| **Session Routes** |
| AdminDashboard.js | `/api/sessions` (GET) | `/api/sessions` | `/api/sessions` | ✅ MATCH | Working correctly |
| AdminDashboard.js | `/api/sessions` (POST) | `/api/sessions` | `/api/sessions` | ✅ MATCH | Working correctly |
| AdminDashboard.js | `/api/sessions/:id` (PUT) | `/api/sessions/:id` | `/api/sessions/:id` | ✅ MATCH | Working correctly |
| AdminDashboard.js | `/api/sessions/:id` (DELETE) | `/api/sessions/:id` | `/api/sessions/:id` | ✅ MATCH | Working correctly |
| TrainerDashboard.js | `/api/sessions` (GET) | `/api/sessions` | `/api/sessions` | ✅ MATCH | Working correctly |
| TrainerDashboard.js | `/api/sessions` (POST) | `/api/sessions` | `/api/sessions` | ✅ MATCH | Working correctly |
| TrainerDashboard.js | `http://localhost:5000/api/sessions/:id/attendance` (PATCH) | `/api/sessions/:id/attendance` | `/api/sessions/:id/attendance` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| CalendarView.js | `http://localhost:5000/api/sessions` (GET) | `/api/sessions` | `/api/sessions` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| 12ga.js | `http://localhost:5000/api/sessions` (GET) | `/api/sessions` | `/api/sessions` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| 12ga.js | `http://localhost:5000/api/sessions/:id` (DELETE) | `/api/sessions/:id` | `/api/sessions/:id` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| 12ga.js | `http://localhost:5000/api/sessions/:id` (PUT) | `/api/sessions/:id` | `/api/sessions/:id` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| 12ga.js | `http://localhost:5000/api/sessions` (POST) | `/api/sessions` | `/api/sessions` | ⚠️ HARDCODED URL | Remove hardcoded localhost |
| **User Management Routes** |
| AdminDashboard.js | `/api/users` (GET) | `/api/users` | `/api/auth/users` | ❌ MISMATCH | Users route not mounted in server |
| AdminDashboard.js | `/api/users` (POST) | `/api/users` | `/api/auth/users` | ❌ MISMATCH | Users route not mounted in server |
| AdminDashboard.js | `/api/users/:id` (PUT) | `/api/users/:id` | `/api/auth/users/:id` | ❌ MISMATCH | Users route not mounted in server |
| AdminDashboard.js | `/api/users/:id` (DELETE) | `/api/users/:id` | `/api/auth/users/:id` | ❌ MISMATCH | Users route not mounted in server |
| TrainerUtilization.js | `/api/users` (GET) | `/api/users` | `/api/auth/users` | ❌ MISMATCH | Users route not mounted in server |
| 12ga.js | `http://localhost:5000/api/users/trainers` (GET) | `/api/users/trainers` | **MISSING** | ❌ MISSING | No trainers endpoint exists |
| **Profile Routes** |
| TrainerDashboard.js | `/api/profile` (PUT) | `/api/profile` | `/api/auth/profile` | ❌ MISMATCH | Profile route under auth |
| **Notification Routes** |
| AdminDashboard.js | `/api/notifications/email` (POST) | `/api/notifications/email` | `/api/notifications/email` | ✅ MATCH | Working correctly |
| AdminDashboard.js | `/api/notifications` (GET) | `/api/notifications` | `/api/notifications` | ✅ MATCH | Working correctly |
| **Busy Slots Routes** |
| TrainerDashboard.js | `/api/busy-slots` (GET) | `/api/busy-slots` | `/api/busy-slots` | ✅ MATCH | Working correctly |
| TrainerDashboard.js | `/api/busy-slots` (POST) | `/api/busy-slots` | `/api/busy-slots` | ✅ MATCH | Working correctly |
| TrainerDashboard.js | `/api/busy-slots/:id` (DELETE) | `/api/busy-slots/:id` | `/api/busy-slots/:id` | ✅ MATCH | Working correctly |

## Issues Identified

### 1. Critical Issues (❌)
- **User Management Endpoints**: Client calls `/api/users` but server has these under `/api/auth/users`
- **Profile Endpoint**: Client calls `/api/profile` but server has it under `/api/auth/profile`
- **Missing Trainers Endpoint**: Client expects `/api/users/trainers` but no such route exists

### 2. Minor Issues (⚠️)
- **Hardcoded URLs**: Several files use `http://localhost:5000` instead of relative paths
- **Inconsistent URL patterns**: Some files mix relative and absolute URLs

## Recommended Solutions

### Option 1: Create Canonical `/api/users` Router (Recommended)
- Create a dedicated `/api/users` router that proxies to existing auth routes
- Mount the new router in server/index.js
- Add a new `/api/users/trainers` endpoint

### Option 2: Update Client to Use `/api/auth/*` Routes
- Update all client-side calls to use `/api/auth/users` instead of `/api/users`
- Update profile calls to use `/api/auth/profile`

### Option 3: Hybrid Approach
- Create `/api/users` router for user management
- Keep auth-specific routes under `/api/auth`
- Add 301 redirects for legacy paths

## Implementation Plan
1. Create new `/api/users` router
2. Add missing `/api/users/trainers` endpoint
3. Mount new router in server/index.js
4. Fix hardcoded URLs in client code
5. Test all endpoints for compatibility
