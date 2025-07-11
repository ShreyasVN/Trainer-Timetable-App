// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorizeRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/sessions - Admin gets all sessions, Trainer gets only their own
router.get('/', auth, async (req, res) => {
  const { id, role } = req.user;

  try {
    let query = `
      SELECT s.*, m.name as trainer_name, m.email AS trainer_email
      FROM sessions s
      JOIN member m ON s.trainer_id = m.id`;
    const params = [];

    if (role === 'trainer') {
      query += ' WHERE s.trainer_id = ?';
      params.push(id);
    }

    query += ' ORDER BY s.date DESC, s.time DESC';
    const [results] = await db.query(query, params);
    
    return sendSuccess(res, results, 200, 'Sessions retrieved successfully');
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return sendError(res, 'Failed to fetch sessions', 500);
  }
});

// POST /api/sessions - Admin or Trainer can create session
router.post('/', auth, async (req, res) => {
  try {
    const { trainer_id, course_name, date, time, location, duration, created_by_trainer } = req.body;
    const role = req.user.role;
    const isTrainer = role === 'trainer';
    const isAdmin = role === 'admin';

    if (!trainer_id || !course_name || !date || !time || !location) {
      return sendError(res, 'All fields are required', 400);
    }

    // Check for busy slot conflict if trainer is scheduling
    if (isTrainer) {
      const [busy] = await db.query(
        `SELECT * FROM busy_slots WHERE trainer_id = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
        [trainer_id, `${date} ${time}`, `${date} ${time}`, `${date} ${time}`, `${date} ${time}`]
      );
      if (busy.length > 0) {
        return sendError(res, 'You are already busy at this time', 409);
      }
    }

    const [result] = await db.query(
      `INSERT INTO sessions (trainer_id, course_name, date, time, location, duration, created_by_trainer, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainer_id,
        course_name,
        date,
        time,
        location,
        duration || 60,
        isTrainer ? 1 : (created_by_trainer ? 1 : 0),
        isTrainer ? 'pending' : 'approved'
      ]
    );
    
    // Notify admin if scheduled by trainer
    if (isTrainer) {
      const [trainer] = await db.query('SELECT email, name FROM member WHERE id = ?', [trainer_id]);
      if (trainer.length > 0) {
        await db.query('INSERT INTO notifications (type, message, recipient_role, `read`) VALUES (?, ?, ?, ?)', [
          'session',
          `Trainer ${trainer[0].name} (${trainer[0].email}) scheduled class '${course_name}' on ${date} ${time}`,
          'admin',
          0
        ]);
      }
    }
    
    // Get the created session with trainer info
    const [newSession] = await db.query(
      `SELECT s.*, m.name as trainer_name, m.email as trainer_email 
       FROM sessions s 
       JOIN member m ON s.trainer_id = m.id 
       WHERE s.id = ?`, 
      [result.insertId]
    );
    
    return sendSuccess(res, newSession[0], 201, 'Session created successfully');
  } catch (err) {
    console.error('Error creating session:', err);
    return sendError(res, 'Failed to create session', 500);
  }
});

// GET /api/sessions/:id - Get single session
router.get('/:id', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { id: userId, role } = req.user;
    
    let query = `
      SELECT s.*, m.name as trainer_name, m.email AS trainer_email
      FROM sessions s
      JOIN member m ON s.trainer_id = m.id
      WHERE s.id = ?`;
    const params = [sessionId];
    
    // Trainers can only see their own sessions
    if (role === 'trainer') {
      query += ' AND s.trainer_id = ?';
      params.push(userId);
    }
    
    const [results] = await db.query(query, params);
    
    if (results.length === 0) {
      return sendError(res, 'Session not found', 404);
    }
    
    return sendSuccess(res, results[0], 200, 'Session retrieved successfully');
  } catch (err) {
    console.error('Error fetching session:', err);
    return sendError(res, 'Failed to fetch session', 500);
  }
});

// PUT /api/sessions/:id - Admin only
router.put('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { trainer_id, course_name, date, time, location, duration } = req.body;

    if (!trainer_id || !course_name || !date || !time || !location) {
      return sendError(res, 'All fields are required', 400);
    }

    // Check if session exists
    const [existingSession] = await db.query('SELECT id FROM sessions WHERE id = ?', [sessionId]);
    if (existingSession.length === 0) {
      return sendError(res, 'Session not found', 404);
    }

    const [result] = await db.query(
      `UPDATE sessions SET trainer_id = ?, course_name = ?, date = ?, time = ?, location = ?, duration = ? WHERE id = ?`,
      [trainer_id, course_name, date, time, location, duration || 60, sessionId]
    );

    // Get updated session with trainer info
    const [updatedSession] = await db.query(
      `SELECT s.*, m.name as trainer_name, m.email as trainer_email 
       FROM sessions s 
       JOIN member m ON s.trainer_id = m.id 
       WHERE s.id = ?`, 
      [sessionId]
    );

    return sendSuccess(res, updatedSession[0], 200, 'Session updated successfully');
  } catch (err) {
    console.error('Error updating session:', err);
    return sendError(res, 'Failed to update session', 500);
  }
});

// DELETE /api/sessions/:id - Admin only
router.delete('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const sessionId = req.params.id;

    // Get session info before deletion
    const [existingSession] = await db.query(
      `SELECT s.*, m.name as trainer_name, m.email as trainer_email 
       FROM sessions s 
       JOIN member m ON s.trainer_id = m.id 
       WHERE s.id = ?`, 
      [sessionId]
    );
    
    if (existingSession.length === 0) {
      return sendError(res, 'Session not found', 404);
    }

    await db.query(`DELETE FROM sessions WHERE id = ?`, [sessionId]);
    return sendSuccess(res, { deletedSession: existingSession[0] }, 200, 'Session deleted successfully');
  } catch (err) {
    console.error('Error deleting session:', err);
    return sendError(res, 'Failed to delete session', 500);
  }
});

// PATCH /api/sessions/:id/attendance - Trainer only: Toggle attendance
router.patch('/:id/attendance', auth, authorizeRole(['trainer']), async (req, res) => {
  try {
    const sessionId = req.params.id;
    const trainerId = req.user.id;

    const [rows] = await db.query(
      'SELECT attended FROM sessions WHERE id = ? AND trainer_id = ?',
      [sessionId, trainerId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Session not found or not authorized', 404);
    }

    const currentStatus = rows[0].attended || 0;
    const newStatus = currentStatus ? 0 : 1;

    await db.query('UPDATE sessions SET attended = ? WHERE id = ?', [
      newStatus,
      sessionId,
    ]);

    return sendSuccess(res, { attended: newStatus }, 200, 'Attendance updated successfully');
  } catch (err) {
    console.error('Error updating attendance:', err);
    return sendError(res, 'Failed to update attendance', 500);
  }
});

// PUT /api/sessions/:id/approve - Admin approves/rejects trainer-scheduled session
router.put('/:id/approve', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { approval_status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(approval_status)) {
      return sendError(res, 'Invalid approval status', 400);
    }
    
    // Check if session exists
    const [existingSession] = await db.query('SELECT id FROM sessions WHERE id = ?', [sessionId]);
    if (existingSession.length === 0) {
      return sendError(res, 'Session not found', 404);
    }
    
    await db.query(
      `UPDATE sessions SET approval_status = ? WHERE id = ?`,
      [approval_status, sessionId]
    );
    
    // Get updated session with trainer info
    const [updatedSession] = await db.query(
      `SELECT s.*, m.name as trainer_name, m.email as trainer_email 
       FROM sessions s 
       JOIN member m ON s.trainer_id = m.id 
       WHERE s.id = ?`, 
      [sessionId]
    );
    
    return sendSuccess(res, updatedSession[0], 200, 'Session approval status updated successfully');
  } catch (err) {
    console.error('Error updating session approval:', err);
    return sendError(res, 'Failed to update session approval', 500);
  }
});

module.exports = router;
