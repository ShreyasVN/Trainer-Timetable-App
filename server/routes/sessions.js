// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorizeRole } = require('../middleware/auth');

// GET /api/sessions - Admin gets all sessions, Trainer gets only their own
router.get('/', auth, async (req, res) => {
  const { id, role } = req.user;

  try {
    let query = `
      SELECT s.*, m.email AS trainer_email
      FROM sessions s
      JOIN member m ON s.trainer_id = m.id`;
    const params = [];

    if (role === 'trainer') {
      query += ' WHERE s.trainer_id = ?';
      params.push(id);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/sessions - Admin or Trainer can create session
router.post('/', auth, async (req, res) => {
  const { trainer_id, course_name, date, time, location, duration, created_by_trainer } = req.body;
  const role = req.user.role;
  const isTrainer = role === 'trainer';
  const isAdmin = role === 'admin';

  if (!trainer_id || !course_name || !date || !time || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check for busy slot conflict if trainer is scheduling
  if (isTrainer) {
    const [busy] = await db.query(
      `SELECT * FROM busy_slots WHERE trainer_id = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [trainer_id, `${date} ${time}`, `${date} ${time}`, `${date} ${time}`, `${date} ${time}`]
    );
    if (busy.length > 0) {
      return res.status(409).json({ error: 'You are already busy at this time.' });
    }
  }

  try {
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
      const [[trainer]] = await db.query('SELECT email FROM member WHERE id = ?', [trainer_id]);
      await db.query('INSERT INTO notifications (type, message, recipient_role, read) VALUES (?, ?, ?, ?)', [
        'session',
        `Trainer ${trainer.email} scheduled class '${course_name}' on ${date} ${time}`,
        'admin',
        0
      ]);
    }
    res.status(201).json({ id: result.insertId, message: 'Session created successfully' });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PUT /api/sessions/:id - Admin only
router.put('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  const sessionId = req.params.id;
  const { trainer_id, course_name, date, time, location } = req.body;

  if (!trainer_id || !course_name || !date || !time || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await db.query(
      `UPDATE sessions SET trainer_id = ?, course_name = ?, date = ?, time = ?, location = ? WHERE id = ?`,
      [trainer_id, course_name, date, time, location, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session updated successfully' });
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/sessions/:id - Admin only
router.delete('/:id', auth, authorizeRole(['admin']), async (req, res) => {
  const sessionId = req.params.id;

  try {
    const [result] = await db.query(`DELETE FROM sessions WHERE id = ?`, [sessionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// PATCH /api/sessions/:id/attendance - Trainer only: Toggle attendance
router.patch('/:id/attendance', auth, authorizeRole(['trainer']), async (req, res) => {
  const sessionId = req.params.id;
  const trainerId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT attended FROM sessions WHERE id = ? AND trainer_id = ?',
      [sessionId, trainerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }

    const currentStatus = rows[0].attended || 0;
    const newStatus = currentStatus ? 0 : 1;

    await db.query('UPDATE sessions SET attended = ? WHERE id = ?', [
      newStatus,
      sessionId,
    ]);

    res.json({ message: 'Attendance updated', attended: newStatus });
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// PUT /api/sessions/:id/approve - Admin approves/rejects trainer-scheduled session
router.put('/:id/approve', auth, authorizeRole(['admin']), async (req, res) => {
  const sessionId = req.params.id;
  const { approval_status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(approval_status)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }
  try {
    const [result] = await db.query(
      `UPDATE sessions SET approval_status = ? WHERE id = ?`,
      [approval_status, sessionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session status updated' });
  } catch (err) {
    console.error('Error updating session approval:', err);
    res.status(500).json({ error: 'Failed to update session approval' });
  }
});

module.exports = router;
