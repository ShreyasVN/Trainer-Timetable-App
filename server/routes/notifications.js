// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth } = require('../middleware/auth'); // ✅ Fixed destructuring
const db = require('../db');

// POST /api/notifications/email
router.post('/email', auth, async (req, res) => {
  const { recipient, subject, message } = req.body;

  if (!recipient || !subject || !message) {
    return res.status(400).json({ error: 'Missing email fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Trainer Scheduler" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject,
      text: message
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Email sending failed:', err);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

// POST /api/notifications - In-app notification (trainer notifies admin)
router.post('/', auth, async (req, res) => {
  const { type, message } = req.body;
  // Only trainers can notify admin
  if (req.user.role !== 'trainer') return res.status(403).json({ error: 'Only trainers can send admin notifications' });
  try {
    await db.query('INSERT INTO notifications (type, message, recipient_role, read) VALUES (?, ?, ?, ?)', [type, message, 'admin', 0]);
    res.status(201).json({ message: 'Notification sent' });
  } catch (err) {
    console.error('Failed to create notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// GET /api/notifications - Admin fetches notifications
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can view notifications' });
  try {
    const [results] = await db.query('SELECT * FROM notifications WHERE recipient_role = ? ORDER BY created_at DESC LIMIT 50', ['admin']);
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
