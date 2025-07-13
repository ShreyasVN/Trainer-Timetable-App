# Trainer Timetable API Documentation

## Overview

The Trainer Timetable API is a comprehensive RESTful web service designed to manage trainer schedules, sessions, user accounts, and notifications. Built with Node.js, Express, and MySQL, it provides secure endpoints for both trainers and administrators to effectively manage training operations.

## Base URL

```
http://localhost:5000/api
```

## Authentication

### Bearer Token Authentication

All API endpoints (except public auth endpoints) require Bearer token authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

### Obtaining a Token

Use the `/auth/login` endpoint to obtain a JWT token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "password123"
  }'
```

## Standard Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists or conflicts |
| 500 | Internal Server Error - Server-side error |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## API Endpoints

### 🔐 Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "trainer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate user and obtain JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "trainer",
      "name": "John Doe"
    }
  },
  "message": "Login successful"
}
```

#### GET /auth/profile
Get current user profile. **Requires Authentication**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "trainer",
      "name": "John Doe"
    }
  },
  "message": "Profile retrieved successfully"
}
```

#### PUT /auth/profile
Update current user profile. **Requires Authentication**

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "password": "newpassword123"
}
```

#### GET /auth/verify
Verify JWT token validity. **Requires Authentication**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "trainer",
      "name": "John Doe"
    }
  },
  "message": "Token is valid"
}
```

---

### 👥 User Management

#### GET /users
Get all users. **Admin Only**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "trainer",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

#### GET /users/trainers
Get all trainers. **Requires Authentication**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "trainer",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Trainers retrieved successfully"
}
```

#### GET /users/:id
Get user by ID. **Admin Only**

#### POST /users
Create new user. **Admin Only**

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "trainer"
}
```

#### PUT /users/:id
Update user by ID. **Admin Only**

#### DELETE /users/:id
Delete user by ID. **Admin Only**

#### GET /users/profile
Get current user profile (legacy endpoint). **Requires Authentication**

#### PUT /users/profile
Update current user profile (legacy endpoint). **Requires Authentication**

---

### 📅 Session Management

#### GET /sessions
Get sessions based on user role.
- **Admin**: Gets all sessions
- **Trainer**: Gets only their own sessions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trainer_id": 1,
      "course_name": "Advanced JavaScript",
      "date": "2024-01-15",
      "time": "10:00:00",
      "location": "Room 101",
      "duration": 60,
      "created_by_trainer": 1,
      "approval_status": "approved",
      "attended": 0,
      "trainer_name": "John Doe",
      "trainer_email": "john@example.com"
    }
  ],
  "message": "Sessions retrieved successfully"
}
```

#### POST /sessions
Create new session. **Requires Authentication**

**Request Body:**
```json
{
  "trainer_id": 1,
  "course_name": "Advanced JavaScript",
  "date": "2024-01-15",
  "time": "10:00:00",
  "location": "Room 101",
  "duration": 60,
  "created_by_trainer": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "trainer_id": 1,
    "course_name": "Advanced JavaScript",
    "date": "2024-01-15",
    "time": "10:00:00",
    "location": "Room 101",
    "duration": 60,
    "created_by_trainer": 1,
    "approval_status": "pending",
    "attended": 0,
    "trainer_name": "John Doe",
    "trainer_email": "john@example.com"
  },
  "message": "Session created successfully"
}
```

#### GET /sessions/:id
Get session by ID. **Requires Authentication**

#### PUT /sessions/:id
Update session by ID. **Admin Only**

#### DELETE /sessions/:id
Delete session by ID. **Admin Only**

#### PATCH /sessions/:id/attendance
Toggle session attendance. **Trainer Only**

**Response:**
```json
{
  "success": true,
  "data": {
    "attended": 1
  },
  "message": "Attendance updated successfully"
}
```

#### PUT /sessions/:id/approve
Approve/reject trainer-scheduled session. **Admin Only**

**Request Body:**
```json
{
  "approval_status": "approved"
}
```

**Valid approval statuses:** `approved`, `rejected`, `pending`

---

### 🚫 Busy Slots Management

#### GET /busy-slots
Get busy slots based on user role.
- **Admin**: Gets all busy slots
- **Trainer**: Gets only their own busy slots

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trainer_id": 1,
      "start_time": "2024-01-15T14:00:00Z",
      "end_time": "2024-01-15T16:00:00Z",
      "reason": "Personal appointment",
      "created_at": "2024-01-01T00:00:00Z",
      "trainer_name": "John Doe",
      "trainer_email": "john@example.com"
    }
  ],
  "message": "Busy slots retrieved successfully"
}
```

#### POST /busy-slots
Create new busy slot. **Trainer Only**

**Request Body:**
```json
{
  "start_time": "2024-01-15T14:00:00Z",
  "end_time": "2024-01-15T16:00:00Z",
  "reason": "Personal appointment"
}
```

#### GET /busy-slots/:id
Get busy slot by ID. **Requires Authentication**

#### PUT /busy-slots/:id
Update busy slot by ID. **Trainer Only (own slots)**

#### DELETE /busy-slots/:id
Delete busy slot by ID. **Trainer Only (own slots)**

---

### 🔔 Notifications

#### GET /notifications
Get notifications with pagination. **Admin Only**

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "session",
        "message": "Trainer John Doe scheduled class 'Advanced JavaScript' on 2024-01-15 10:00:00",
        "recipient_role": "admin",
        "read": 0,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1
  },
  "message": "Notifications retrieved successfully"
}
```

#### POST /notifications/email
Send email notification. **Admin Only**

**Request Body:**
```json
{
  "recipient": "trainer@example.com",
  "subject": "Schedule Update",
  "message": "Your schedule has been updated."
}
```

#### POST /notifications
Create in-app notification. **Trainer Only**

**Request Body:**
```json
{
  "type": "session",
  "message": "Requesting schedule change for tomorrow's session"
}
```

#### GET /notifications/:id
Get notification by ID. **Admin Only**

#### PATCH /notifications/:id/read
Mark notification as read/unread. **Admin Only**

**Request Body:**
```json
{
  "read": true
}
```

#### DELETE /notifications/:id
Delete notification. **Admin Only**

---

## Role-Based Access Control

### Admin Permissions
- Full access to all endpoints
- User management (CRUD operations)
- Session management (approve, reject, modify)
- View all sessions and busy slots
- Manage notifications
- Send email notifications

### Trainer Permissions
- Manage own profile
- View and create sessions (requires approval)
- Manage own busy slots
- Toggle attendance for own sessions
- Create in-app notifications to admin
- View trainers list

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute
- **Email notifications**: 5 requests per minute

## Data Validation

### Input Validation Rules

#### User Registration/Creation
- Name: Required, minimum 2 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Role: Required, must be 'trainer' or 'admin'

#### Session Creation
- trainer_id: Required, must exist in database
- course_name: Required, minimum 3 characters
- date: Required, valid date format (YYYY-MM-DD)
- time: Required, valid time format (HH:MM:SS)
- location: Required, minimum 3 characters
- duration: Optional, defaults to 60 minutes

#### Busy Slots
- start_time: Required, valid ISO 8601 datetime
- end_time: Required, valid ISO 8601 datetime, must be after start_time
- reason: Optional, descriptive text

## Security Features

### JWT Token Security
- Tokens expire after 24 hours
- Tokens include user ID, email, role, and name
- Secret key stored in environment variables

### Password Security
- Passwords hashed using bcrypt with salt rounds of 10
- Minimum password length of 6 characters
- Password complexity validation recommended

### Database Security
- SQL injection prevention through parameterized queries
- Input sanitization and validation
- Database connection pooling for optimal performance

## Environment Variables

Required environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trainer_timetable

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Testing

### Sample cURL Commands

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trainer@example.com", "password": "password123"}'
```

#### Get Sessions
```bash
curl -X GET http://localhost:5000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": 1,
    "course_name": "Advanced JavaScript",
    "date": "2024-01-15",
    "time": "10:00:00",
    "location": "Room 101",
    "duration": 60
  }'
```

## Database Schema

### Key Tables

#### member
- id (Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR, Hashed)
- role (ENUM: 'trainer', 'admin')
- created_at (TIMESTAMP)

#### sessions
- id (Primary Key)
- trainer_id (Foreign Key → member.id)
- course_name (VARCHAR)
- date (DATE)
- time (TIME)
- location (VARCHAR)
- duration (INT, minutes)
- created_by_trainer (BOOLEAN)
- approval_status (ENUM: 'pending', 'approved', 'rejected')
- attended (BOOLEAN)
- created_at (TIMESTAMP)

#### busy_slots
- id (Primary Key)
- trainer_id (Foreign Key → member.id)
- start_time (DATETIME)
- end_time (DATETIME)
- reason (TEXT)
- created_at (TIMESTAMP)

#### notifications
- id (Primary Key)
- type (VARCHAR)
- message (TEXT)
- recipient_role (ENUM: 'admin', 'trainer')
- read (BOOLEAN)
- created_at (TIMESTAMP)

## API Versioning

Current API version: **v1**

Future versions will be accessible via:
```
/api/v2/endpoint
```

## Support and Contact

For API support, technical issues, or feature requests:
- Email: support@trainertimetable.com
- Documentation: [Link to full documentation]
- Issue Tracker: [Link to GitHub issues]

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication system with JWT
- Session management
- User management
- Busy slots functionality
- Notification system
- Email notifications

---

## Complete API Routes Matrix

For a comprehensive view of all API endpoints, request/response formats, and client-server alignment, please refer to:

**[API_ROUTES_MATRIX.md](./API_ROUTES_MATRIX.md)**

This document provides:
- Complete endpoint mapping
- Client-server route alignment status
- Implementation details
- Known issues and resolutions
- Testing guidelines

---

*Last updated: January 2024*
*API Version: 1.0.0*
