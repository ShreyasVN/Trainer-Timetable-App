Trainer Timetable App
This is a full-stack application designed to manage trainer schedules and session utilization. It features user authentication (login/register), role-based access (Trainer and Admin), and an interactive calendar view for managing sessions.

Features
User Authentication: Secure login and registration for trainers and administrators.

Role-Based Access:

Trainers: View their assigned sessions on a personal calendar. Receive notifications for upcoming sessions.

Admins: View all trainer sessions, add new sessions, edit existing sessions, and delete sessions.

Interactive Calendar: Utilizes FullCalendar for daily, weekly, and monthly views of sessions.

Session Management: Admins can create, update, and delete session entries.

Notifications: Highlights today's sessions and provides reminders for sessions within the next 24 hours.

MySQL Database: Stores user (member) and session (trainer_utilization) data.

Auth Flow
The application uses a centralized authentication system with a single storage approach and unified axios instance:

**Token Management**: All authentication tokens are managed through a centralized `tokenManager.js` utility that:
- Stores JWT tokens securely in localStorage using a single `TOKEN_KEY`
- Validates token format and expiration before use
- Automatically clears expired or malformed tokens
- Provides debugging utilities for troubleshooting

**Axios Instance**: A single configured axios instance (`apiClient`) handles all API requests:
- Located in `client/src/api/axios.js`
- Automatically attaches Authorization headers using the token manager
- Includes request/response interceptors for token validation and error handling
- Handles 401/403 responses by clearing tokens and triggering logout events

**API Services**: All API calls are organized through service modules:
- `authService`: Login, register, verify, logout
- `sessionService`: Session CRUD operations
- `userService`: User management
- `notificationService`: Notification handling
- `busySlotService`: Busy slot management
- Consolidated exports through `client/src/api.js` for easy importing

**Authentication Flow**:
1. User logs in → Token received from backend
2. Token stored via `tokenManager.setToken()`
3. All subsequent API calls automatically include the token
4. Token validated on each request (format, expiration)
5. 401/403 responses trigger automatic logout and token clearing

Technologies Used
Frontend: React.js, Axios, FullCalendar, Tailwind CSS

Backend: Node.js, Express.js, mysql2 (for MySQL connection), bcryptjs (for password hashing), jsonwebtoken (for JWT authentication), dotenv

Database: MySQL

Setup Instructions
Prerequisites
Node.js (LTS version recommended)

npm (Node Package Manager) or Yarn

MySQL Server (e.g., XAMPP, WAMP, Docker, or standalone installation)

1. Database Setup
Start your MySQL server.

Access your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or MySQL command line).

Execute the SQL script located at sql/trainer_timetable.sql to create the cmis database and its necessary tables (member, trainer_utilization).

# Example using MySQL command-line client
mysql -u your_mysql_username -p < trainer_timetable.sql
# It will prompt for your password. If your database name is different, specify it:
# mysql -u your_mysql_username -p your_database_name < trainer_timetable.sql

Add Sample Data (Optional but Recommended for Testing):
You can register users via the UI, but for quick testing, you can manually insert users into the member table. Remember to generate bcrypt hashes for passwords.
Example: To hash 'password123', use a Node.js console:

const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('password123', 10));

Then, insert into your member table:

INSERT INTO member (email, password, role) VALUES
('admin@example.com', 'YOUR_BCRYPT_HASH_FOR_PASSWORD', 'admin'),
('trainer1@example.com', 'YOUR_BCRYPT_HASH_FOR_PASSWORD', 'trainer');

2. Backend Setup
Navigate to the backend directory:

cd trainer-timetable-app/backend

Create a .env file: In the backend directory, create a file named .env and add your database credentials and a JWT secret.

PORT=5000
JWT_SECRET=YOUR_VERY_STRONG_RANDOM_SECRET_KEY_HERE # IMPORTANT: Change this to a long, random string!

DB_HOST=localhost
DB_USER=root
DB_PASS= # Your MySQL password (leave empty if no password)
DB_NAME=cmis

Install Node.js dependencies:

npm install

Start the backend server:

npm start

You should see console output indicating the server is running on http://localhost:5000 and the database connection is successful. Keep this terminal open.

3. Frontend Setup
Open a new terminal window.

Navigate to the frontend directory:

cd trainer-timetable-app/frontend

Install Node.js dependencies (including FullCalendar and Axios):

npm install axios @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list

Start the frontend development server:

npm start

This will typically open your browser to http://localhost:3000.

Example Login Credentials (if using sample data)
Admin:

Email: admin@example.com

Password: password123 (or whatever you hashed)

Trainer:

Email: trainer1@example.com

Password: password123 (or whatever you hashed)

Screenshots
(Placeholder for screenshots of Trainer calendar view and notification highlight)

Troubleshooting
"Failed to fetch" or "Cannot GET /api/auth": Ensure your backend server (npm start in backend directory) is running and accessible on http://localhost:5000. Check your firewall.

"Invalid credentials": Double-check your email and password. Ensure you've registered the account or that the sample data is correctly inserted with bcrypt-hashed passwords.

"Could not resolve @fullcalendar/...": Ensure you've run npm install for the frontend dependencies, including FullCalendar packages.

"Cannot POST /api/auth/register": Ensure your backend server has been restarted after any code changes.