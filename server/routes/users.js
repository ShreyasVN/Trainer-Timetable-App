const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { auth, authorizeRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

// Get all users (admin only) - Canonical route for /api/users
router.get('/', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM member ORDER BY created_at DESC');
    return sendSuccess(res, rows, 200, 'Users retrieved successfully');
  } catch (err) {
    console.error('Error fetching users:', err);
    return sendError(res, 'Failed to fetch users', 500);
  }
});

// Get only trainers - New endpoint for /api/users/trainers
router.get('/trainers', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM member WHERE role = ? ORDER BY created_at DESC', ['trainer']);
    return sendSuccess(res, rows, 200, 'Trainers retrieved successfully');
  } catch (err) {
    console.error('Error fetching trainers:', err);
    return sendError(res, 'Failed to fetch trainers', 500);
  }
});

// Get single user by ID (admin only)
router.get('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM member WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return sendError(res, 'User not found', 404);
    }
    
    return sendSuccess(res, rows[0], 200, 'User retrieved successfully');
  } catch (err) {
    console.error('Error fetching user:', err);
    return sendError(res, 'Failed to fetch user', 500);
  }
});

// Add a new user (admin only) - Canonical route for /api/users
router.post('/', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return sendError(res, 'Name, email, password, and role are required', 400);
    }
    
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }
    
    if (!['trainer', 'admin'].includes(role)) {
      return sendError(res, 'Role must be either "trainer" or "admin"', 400);
    }
    
    const [existingUsers] = await db.query('SELECT id FROM member WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return sendError(res, 'User with this email already exists', 409);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    
    // Return the created user (without password)
    const [newUser] = await db.query('SELECT id, name, email, role, created_at FROM member WHERE id = ?', [result.insertId]);
    return sendSuccess(res, newUser[0], 201, 'User created successfully');
  } catch (err) {
    console.error('Create user error:', err);
    return sendError(res, 'Failed to create user', 500);
  }
});

// Update a user (admin only) - Canonical route for /api/users/:id
router.put('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { id } = req.params;
    
    if (!name || !email || !role) {
      return sendError(res, 'Name, email, and role are required', 400);
    }
    
    // Check if user exists
    const [existingUser] = await db.query('SELECT id FROM member WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return sendError(res, 'User not found', 404);
    }
    
    let updateQuery = 'UPDATE member SET name = ?, email = ?, role = ?';
    let params = [name, email, role];
    
    if (password) {
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await db.query(updateQuery, params);
    
    // Return updated user info (without password)
    const [updatedUser] = await db.query('SELECT id, name, email, role, created_at FROM member WHERE id = ?', [id]);
    return sendSuccess(res, updatedUser[0], 200, 'User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    return sendError(res, 'Failed to update user', 500);
  }
});

// Delete a user (admin only) - Canonical route for /api/users/:id
router.delete('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await db.query('SELECT id, name, email FROM member WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return sendError(res, 'User not found', 404);
    }
    
    await db.query('DELETE FROM member WHERE id = ?', [id]);
    return sendSuccess(res, { deletedUser: existingUser[0] }, 200, 'User deleted successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    return sendError(res, 'Failed to delete user', 500);
  }
});

// Get current user profile - /api/users/me
router.get('/me', auth, (req, res) => {
  return sendSuccess(res, { user: req.user }, 200, 'Profile retrieved successfully');
});

// Get user profile - For backwards compatibility with /api/users/profile
router.get('/profile', auth, (req, res) => {
  return sendSuccess(res, { user: req.user }, 200, 'Profile retrieved successfully');
});

// Update user profile - For backwards compatibility with /api/users/profile
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

module.exports = router;
