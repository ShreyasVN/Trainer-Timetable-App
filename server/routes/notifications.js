// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth, authorizeRole } = require('../middleware/auth');
const db = require('../db');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/notifications/email - Send email notification
router.post('/email', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return sendError(res, 'Recipient, subject, and message are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return sendError(res, 'Email service not configured', 500);
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Trainer Scheduler" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject,
      text: message
    });

    return sendSuccess(res, { messageId: info.messageId }, 200, 'Email sent successfully');
  } catch (err) {
    console.error('Email sending failed:', err);
    return sendError(res, 'Email sending failed', 500);
  }
});

// GET /api/notifications - Admin fetches all notifications
router.get('/', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const [results] = await db.query(
      'SELECT * FROM notifications WHERE recipient_role = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', 
      ['admin', parseInt(limit), parseInt(offset)]
    );
    
    // Get total count for pagination
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM notifications WHERE recipient_role = ?', ['admin']);
    const total = countResult[0].total;
    
    return sendSuccess(res, {
      notifications: results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    }, 200, 'Notifications retrieved successfully');
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
});

// GET /api/notifications/:id - Get single notification
router.get('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const [results] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND recipient_role = ?', 
      [notificationId, 'admin']
    );
    
    if (results.length === 0) {
      return sendError(res, 'Notification not found', 404);
    }
    
    return sendSuccess(res, results[0], 200, 'Notification retrieved successfully');
  } catch (err) {
    console.error('Failed to fetch notification:', err);
    return sendError(res, 'Failed to fetch notification', 500);
  }
});

// POST /api/notifications - Create in-app notification (trainer notifies admin)
router.post('/', auth, authorizeRole(['trainer']), async (req, res) => {
  try {
    const { type, message } = req.body;
    
    if (!type || !message) {
      return sendError(res, 'Type and message are required', 400);
    }
    
    const [result] = await db.query(
      'INSERT INTO notifications (type, message, recipient_role, `read`) VALUES (?, ?, ?, ?)', 
      [type, message, 'admin', 0]
    );
    
    // Get the created notification
    const [newNotification] = await db.query(
      'SELECT * FROM notifications WHERE id = ?', 
      [result.insertId]
    );
    
    return sendSuccess(res, newNotification[0], 201, 'Notification created successfully');
  } catch (err) {
    console.error('Failed to create notification:', err);
    return sendError(res, 'Failed to create notification', 500);
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { read = true } = req.body;
    
    const [existingNotification] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND recipient_role = ?', 
      [notificationId, 'admin']
    );
    
    if (existingNotification.length === 0) {
      return sendError(res, 'Notification not found', 404);
    }
    
    await db.query(
      'UPDATE notifications SET `read` = ? WHERE id = ?', 
      [read ? 1 : 0, notificationId]
    );
    
    // Get updated notification
    const [updatedNotification] = await db.query(
      'SELECT * FROM notifications WHERE id = ?', 
      [notificationId]
    );
    
    return sendSuccess(res, updatedNotification[0], 200, `Notification marked as ${read ? 'read' : 'unread'}`);
  } catch (err) {
    console.error('Failed to update notification:', err);
    return sendError(res, 'Failed to update notification', 500);
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Get notification info before deletion
    const [existingNotification] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND recipient_role = ?', 
      [notificationId, 'admin']
    );
    
    if (existingNotification.length === 0) {
      return sendError(res, 'Notification not found', 404);
    }
    
    await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
    return sendSuccess(res, { deletedNotification: existingNotification[0] }, 200, 'Notification deleted successfully');
  } catch (err) {
    console.error('Failed to delete notification:', err);
    return sendError(res, 'Failed to delete notification', 500);
  }
});

module.exports = router;
