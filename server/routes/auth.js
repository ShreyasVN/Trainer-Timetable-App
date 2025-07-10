const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth, authorizeRole } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Input validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    if (!['trainer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "trainer" or "admin"' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM member WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    
    res.status(201).json({ message: 'User registered successfully ✅' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM member WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Protected admin route
router.get('/admin-data', auth, authorizeRole(['admin']), (req, res) => {
  res.json({ message: 'This is protected for admins only', user: req.user });
});

// Authenticated route to check profile
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// Get all users (admin only)
router.get('/users', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, role, created_at FROM member ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a new user (admin only)
router.post('/users', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!['trainer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "trainer" or "admin"' });
    }
    const [existingUsers] = await db.query('SELECT id FROM member WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user (admin only)
router.put('/users/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { id } = req.params;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    let updateQuery = 'UPDATE member SET name = ?, email = ?, role = ?';
    let params = [name, email, role];
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    updateQuery += ' WHERE id = ?';
    params.push(id);
    await db.query(updateQuery, params);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM member WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Trainer profile update (trainer or admin)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    let updateQuery = 'UPDATE member SET name = ?, email = ?';
    let params = [name, email];
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    await db.query(updateQuery, params);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
