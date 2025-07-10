const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorizeRole } = require('../middleware/auth');

// GET /api/busy-slots - Trainer gets own, Admin gets all
router.get('/', auth, async (req, res) => {
  const { id, role } = req.user;
  try {
    let query = 'SELECT * FROM busy_slots';
    let params = [];
    if (role === 'trainer') {
      query += ' WHERE trainer_id = ?';
      params.push(id);
    }
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error fetching busy slots:', err);
    res.status(500).json({ error: 'Failed to fetch busy slots' });
  }
});

// POST /api/busy-slots - Trainer creates busy slot
router.post('/', auth, authorizeRole(['trainer']), async (req, res) => {
  const trainer_id = req.user.id;
  const { start_time, end_time, reason } = req.body;
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'Start and end time are required' });
  }
  try {
    // Check for overlap with existing busy slots
    const [conflicts] = await db.query(
      `SELECT * FROM busy_slots WHERE trainer_id = ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`,
      [trainer_id, end_time, start_time, start_time, end_time]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Busy slot overlaps with existing busy time' });
    }
    const [result] = await db.query(
      'INSERT INTO busy_slots (trainer_id, start_time, end_time, reason) VALUES (?, ?, ?, ?)',
      [trainer_id, start_time, end_time, reason || null]
    );
    // Notify admin
    const [[trainer]] = await db.query('SELECT email FROM member WHERE id = ?', [trainer_id]);
    await db.query('INSERT INTO notifications (type, message, recipient_role, read) VALUES (?, ?, ?, ?)', [
      'busy',
      `Trainer ${trainer.email} added busy slot from ${start_time} to ${end_time}`,
      'admin',
      0
    ]);
    res.status(201).json({ id: result.insertId, message: 'Busy slot created' });
  } catch (err) {
    console.error('Error creating busy slot:', err);
    res.status(500).json({ error: 'Failed to create busy slot' });
  }
});

// DELETE /api/busy-slots/:id - Trainer deletes own busy slot
router.delete('/:id', auth, authorizeRole(['trainer']), async (req, res) => {
  const trainer_id = req.user.id;
  const slotId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM busy_slots WHERE id = ? AND trainer_id = ?', [slotId, trainer_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Busy slot not found' });
    }
    res.json({ message: 'Busy slot deleted' });
  } catch (err) {
    console.error('Error deleting busy slot:', err);
    res.status(500).json({ error: 'Failed to delete busy slot' });
  }
});

module.exports = router; 