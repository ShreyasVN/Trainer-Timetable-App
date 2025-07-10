// server/index.js or server/app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(express.json());

// Custom logger (optional)
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

// DB connection
const db = require('./db');

// Routes
const authRoutes = require('./routes/auth'); // handles /register, /login
const sessionRoutes = require('./routes/sessions'); // handles /sessions
const notificationsRoutes = require('./routes/notifications'); // handles /notifications
const busySlotsRoutes = require('./routes/busySlots'); // handles /busy-slots

// Mount routes
app.use('/api/auth', authRoutes); // e.g., POST /api/auth/login
app.use('/api/sessions', sessionRoutes); // GET/POST/PATCH/DELETE /api/sessions/*
app.use('/api/notifications', notificationsRoutes); // e.g., POST /api/notifications/email
app.use('/api/busy-slots', busySlotsRoutes); // CRUD for busy slots

// Health check/test route
app.get('/', (req, res) => {
  res.send('Trainer Timetable API is running ✅');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

