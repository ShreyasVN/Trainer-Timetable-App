# 🎯 Trainer Timetable Management System

## 📋 Overview

The **Trainer Timetable Management System** is a comprehensive web application designed to streamline the scheduling and management of training sessions. Built for educational institutions, corporate training departments, and fitness centers, this system provides a seamless platform for trainers and administrators to coordinate schedules, manage availability, and track session attendance.

### 🎯 Primary Objectives

- **Efficient Schedule Management**: Simplify the process of creating, updating, and managing training schedules
- **Real-time Availability Tracking**: Allow trainers to mark busy slots and prevent scheduling conflicts
- **Role-based Access Control**: Provide different levels of access for trainers and administrators
- **Automated Notifications**: Keep all stakeholders informed about schedule changes and updates
- **Comprehensive Reporting**: Generate insights on trainer utilization and session attendance

## 🛠️ Tech Stack

### Backend
- **Node.js** 18.x - JavaScript runtime environment
- **Express.js** 4.x - Web application framework
- **MySQL** 8.0 - Relational database management system
- **JWT** - JSON Web Token for authentication
- **bcrypt** - Password hashing library
- **Nodemailer** - Email service integration
- **Joi** - Data validation library

### Frontend
- **React** 18.x - JavaScript library for building user interfaces
- **React Router** 6.x - Client-side routing
- **Tailwind CSS** 3.x - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form state management
- **React Toastify** - Notification system
- **Heroicons** - Icon library
- **FullCalendar** - Calendar component

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **React Testing Library** - React component testing
- **Storybook** - Component development environment
- **Concurrently** - Run multiple commands simultaneously

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Login/Registration** with JWT-based authentication
- **Role-based Access Control** (Admin/Trainer permissions)
- **Password Encryption** using bcrypt
- **Session Management** with token refresh
- **Multi-factor Authentication** support

### 📅 Schedule Management
- **Interactive Calendar View** with drag-and-drop functionality
- **Session Creation & Editing** with conflict detection
- **Recurring Session Support** for regular classes
- **Bulk Operations** for managing multiple sessions
- **Schedule Templates** for common training patterns

### 👥 User Management
- **Trainer Profile Management** with skill sets and availability
- **Student/Participant Management** with enrollment tracking
- **Admin Dashboard** for system-wide management
- **User Activity Tracking** and audit logs
- **Bulk User Import/Export** capabilities

### 🚫 Availability Management
- **Busy Slot Marking** to prevent scheduling conflicts
- **Time-off Requests** with approval workflow
- **Recurring Unavailability** patterns
- **Conflict Resolution** with alternative suggestions
- **Availability Synchronization** across platforms

### 📊 Reporting & Analytics
- **Trainer Utilization Reports** with detailed metrics
- **Attendance Tracking** and analytics
- **Session Performance** insights
- **Revenue Tracking** for paid sessions
- **Export to PDF/Excel** functionality

### 🔔 Notifications
- **Real-time Notifications** for schedule changes
- **Email Notifications** for important updates
- **Push Notifications** for mobile users
- **Customizable Notification Preferences**
- **Reminder System** for upcoming sessions

### 📱 Mobile Responsiveness
- **Fully Responsive Design** for all screen sizes
- **Touch-friendly Interface** for mobile devices
- **Offline Support** for essential features
- **PWA Capabilities** for app-like experience

### 🔧 System Administration
- **System Configuration** and settings management
- **Database Backup & Recovery** tools
- **User Access Management** and permissions
- **System Monitoring** and health checks
- **Security Audit** and compliance tools

## 4. Installation & Setup

Follow the steps below to run the **Trainer Timetable App** locally for development. For a deeper dive into environment variables and advanced configuration, see `ENVIRONMENT_SETUP.md`.

### 4.1 Prerequisites

• Git 2.20 or higher
• Node.js 14 or higher (LTS recommended)
• npm (or yarn) package manager
• MySQL 8.0 server running locally or accessible remotely

### 4.2 Clone the Repository

```bash
# HTTPS
git clone https://github.com/your-org/trainer-timetable-app.git
# or SSH
# git clone git@github.com:your-org/trainer-timetable-app.git
cd trainer-timetable-app
```

### 4.3 Install Dependencies

Install all root‐level, client, and server dependencies with a single command:

```bash
npm install
```

`npm install` triggers the **workspaces** defined in `package.json`, so both the server and client packages are installed automatically.

### 4.4 Environment Variables

Two `.env` files are required—one for the **server** and one for the **client**. Examples are provided in `ENVIRONMENT_SETUP.md`.

1. **Server** – create `server/.env`:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_db_password
   DB_NAME=trainer_timetable
   DB_PORT=3306
   JWT_SECRET=replace_with_secure_random
   CORS_ORIGIN=http://localhost:3001
   NODE_ENV=development
   ```

2. **Client** – create `client/.env`:

   ```env
   PORT=3001
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_API_TIMEOUT=10000
   REACT_APP_APP_NAME=Trainer Timetable App
   REACT_APP_VERSION=1.0.0
   REACT_APP_DEBUG=true
   ```

> **Tip**: Copy the above blocks, adjust values as needed, and keep both `.env` files out of version control.

### 4.5 Database Migration

Create the MySQL schema using the provided script:

```bash
# from the project root
mysql -u root -p < server/db/schema.sql
```

This will create all required tables (`member`, `sessions`, `busy_slots`, etc.). Make sure the `DB_*` variables in `server/.env` match your MySQL credentials.

### 4.6 Run the Application

#### 4.6.1 Full stack (recommended)

```bash
npm run dev
```

The `dev` script:
1. validates environment variables (`npm run check-env`), then
2. concurrently starts the **server** on `http://localhost:5000` and the **client** on `http://localhost:3001`.

#### 4.6.2 Run services individually

```bash
# Start Express server only
npm run server

# Start React client only
npm run client
```

### 4.7 Troubleshooting

Common issues and quick fixes:

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| `EADDRINUSE` on port 5000/3001 | Port already in use | Change `PORT` in the corresponding `.env` file or stop the conflicting process |
| `ER_ACCESS_DENIED_ERROR` when server starts | MySQL credentials incorrect | Verify `DB_USER`, `DB_PASSWORD`, and `DB_HOST` in `server/.env` |
| Client receives CORS errors | Incorrect `CORS_ORIGIN` | Ensure `CORS_ORIGIN` equals the client URL |
| Pre-flight **check-env** script fails | Missing or placeholder env variables | Review the console output and update the variables |

For more detail, see the **Troubleshooting** section in `ENVIRONMENT_SETUP.md`.

## 5. API

*(Document available endpoints, request/response examples, and authentication details.)*

## 6. UI Screens

### Login Screen
![Login Screen](docs/images/ui-screenshots/login-screen.png)

**TODO:** Add screenshot of the login screen once ready.

- **Glassmorphism effect:** The login form uses a glassmorphism background with a subtle blur effect (`backdrop-filter: blur(10px)`), allowing the background content to slightly bleed through.
- **Responsive design:** On smaller screens, the form adapts by adjusting padding and font size to ensure usability.
- **Dark mode support:** The theme adapts based on system preferences or user choice, adjusting foreground and background colors for readability.

### Admin Dashboard
![Admin Dashboard](docs/images/ui-screenshots/admin-dashboard.png)

**TODO:** Add screenshot of the admin dashboard once ready.

- **Consistent layout:** Uses a sidebar navigation with a main content area for streamlined access to features.
- **Responsive elements:** Automatically adjusts to different screen sizes, maintaining usability.
- **Dark mode:** Provides a slate-dark theme with light text, enhancing visibility.

### Trainer Calendar
![Trainer Calendar](docs/images/ui-screenshots/trainer-calendar.png)

**TODO:** Add screenshot of the trainer calendar once ready.

- **Interactive features:** Supports drag-and-drop, click-to-create, and edit events right on the calendar.
- **Views:** Provides month, week, day, and list views, adaptable to user's preference.
- **Mobile responsiveness:** Adapts the view stack for smaller screens, ensuring all features are accessible.

### Glassmorphism Cards
![Glassmorphism Card](docs/images/ui-screenshots/glassmorphism-card.png)

**TODO:** Add screenshot of the glassmorphism card once ready.

- **Visual clarity:** Provides a semi-transparent, blurred background to mimic a frosted-glass effect.
- **Responsive behavior:** Adjusts the blur and opacity levels for optimal viewing on mobile.

---

All components are built with React and support dark mode. They are designed to ensure accessibility and adaptability across different devices and display settings.

For more details on the CSS and component design principles, refer to the [Design System Documentation](client/src/design-system/README.md).

## 7. Project Structure

*(Explain the directory layout and the purpose of important files/folders.)*

## 8. Testing

*(Describe the testing strategy, how to run tests, and view coverage reports.)*

## 9. Deployment

*(Instructions for deploying the application to various environments.)*

## 10. Contributing

*(Guidelines for contributing to the project, reporting issues, and submitting pull requests.)*

## 11. License

*(State the project’s license and any relevant legal information.)*
