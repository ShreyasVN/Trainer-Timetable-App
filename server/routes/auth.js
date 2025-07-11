const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth, authorizeRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Input validation
    if (!name || !email || !password || !role) {
      return sendError(res, 'Name, email, password, and role are required', 400);
    }
    
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }
    
    if (!['trainer', 'admin'].includes(role)) {
      return sendError(res, 'Role must be either "trainer" or "admin"', 400);
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM member WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    
    return sendSuccess(res, { userId: result.insertId }, 201, 'User registered successfully');
  } catch (err) {
    console.error('Registration error:', err);
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const [rows] = await db.query('SELECT * FROM member WHERE email = ?', [email]);
    if (rows.length === 0) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }, 200, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
});

// Get current user profile
router.get('/profile', auth, (req, res) => {
  return sendSuccess(res, { user: req.user }, 200, 'Profile retrieved successfully');
});

// Update current user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;
    
    if (!name || !email) {
      return sendError(res, 'Name and email are required', 400);
    }
    
    let updateQuery = 'UPDATE member SET name = ?, email = ?';
    let params = [name, email];
    
    if (password) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    
    await db.query(updateQuery, params);
    
    // Return updated user info (without password)
    const [rows] = await db.query('SELECT id, name, email, role FROM member WHERE id = ?', [userId]);
    return sendSuccess(res, { user: rows[0] }, 200, 'Profile updated successfully');
  } catch (err) {
    console.error('Profile update error:', err);
    return sendError(res, 'Failed to update profile', 500);
  }
});

// Verify token and return user info
router.get('/verify', auth, (req, res) => {
  return sendSuccess(res, { user: req.user }, 200, 'Token is valid');
});

module.exports = router;
