const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorizeRole } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/busy-slots - Trainer gets own, Admin gets all
router.get('/', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = `
      SELECT bs.*, m.name as trainer_name, m.email as trainer_email 
      FROM busy_slots bs 
      JOIN member m ON bs.trainer_id = m.id`;
    let params = [];
    
    if (role === 'trainer') {
      query += ' WHERE bs.trainer_id = ?';
      params.push(id);
    }
    
    query += ' ORDER BY bs.start_time ASC';
    const [results] = await db.query(query, params);
    return sendSuccess(res, results, 200, 'Busy slots retrieved successfully');
  } catch (err) {
    console.error('Error fetching busy slots:', err);
    return sendError(res, 'Failed to fetch busy slots', 500);
  }
});

// GET /api/busy-slots/:id - Get single busy slot
router.get('/:id', auth, async (req, res) => {
  try {
    const slotId = req.params.id;
    const { id: userId, role } = req.user;
    
    let query = `
      SELECT bs.*, m.name as trainer_name, m.email as trainer_email 
      FROM busy_slots bs 
      JOIN member m ON bs.trainer_id = m.id 
      WHERE bs.id = ?`;
    const params = [slotId];
    
    // Trainers can only see their own busy slots
    if (role === 'trainer') {
      query += ' AND bs.trainer_id = ?';
      params.push(userId);
    }
    
    const [results] = await db.query(query, params);
    
    if (results.length === 0) {
      return sendError(res, 'Busy slot not found', 404);
    }
    
    return sendSuccess(res, results[0], 200, 'Busy slot retrieved successfully');
  } catch (err) {
    console.error('Error fetching busy slot:', err);
    return sendError(res, 'Failed to fetch busy slot', 500);
  }
});

// POST /api/busy-slots - Trainer creates busy slot
router.post('/', auth, authorizeRole(['trainer']), async (req, res) => {
  try {
    const trainer_id = req.user.id;
    const { start_time, end_time, reason } = req.body;
    
    if (!start_time || !end_time) {
      return sendError(res, 'Start and end time are required', 400);
    }
    
    // Validate that end_time is after start_time
    if (new Date(end_time) <= new Date(start_time)) {
      return sendError(res, 'End time must be after start time', 400);
    }
    
    // Check for overlap with existing busy slots
    const [conflicts] = await db.query(
      `SELECT * FROM busy_slots WHERE trainer_id = ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`,
      [trainer_id, end_time, start_time, start_time, end_time]
    );
    
    if (conflicts.length > 0) {
      return sendError(res, 'Busy slot overlaps with existing busy time', 409);
    }
    
    const [result] = await db.query(
      'INSERT INTO busy_slots (trainer_id, start_time, end_time, reason) VALUES (?, ?, ?, ?)',
      [trainer_id, start_time, end_time, reason || null]
    );
    
    // Notify admin
    const [trainer] = await db.query('SELECT email, name FROM member WHERE id = ?', [trainer_id]);
    if (trainer.length > 0) {
      await db.query('INSERT INTO notifications (type, message, recipient_role, `read`) VALUES (?, ?, ?, ?)', [
        'busy',
        `Trainer ${trainer[0].name} (${trainer[0].email}) added busy slot from ${start_time} to ${end_time}`,
        'admin',
        0
      ]);
    }
    
    // Get the created busy slot with trainer info
    const [newBusySlot] = await db.query(
      `SELECT bs.*, m.name as trainer_name, m.email as trainer_email 
       FROM busy_slots bs 
       JOIN member m ON bs.trainer_id = m.id 
       WHERE bs.id = ?`, 
      [result.insertId]
    );
    
    return sendSuccess(res, newBusySlot[0], 201, 'Busy slot created successfully');
  } catch (err) {
    console.error('Error creating busy slot:', err);
    return sendError(res, 'Failed to create busy slot', 500);
  }
});

// PUT /api/busy-slots/:id - Trainer updates own busy slot
router.put('/:id', auth, authorizeRole(['trainer']), async (req, res) => {
  try {
    const trainer_id = req.user.id;
    const slotId = req.params.id;
    const { start_time, end_time, reason } = req.body;
    
    if (!start_time || !end_time) {
      return sendError(res, 'Start and end time are required', 400);
    }
    
    // Validate that end_time is after start_time
    if (new Date(end_time) <= new Date(start_time)) {
      return sendError(res, 'End time must be after start time', 400);
    }
    
    // Check if busy slot exists and belongs to trainer
    const [existingSlot] = await db.query('SELECT id FROM busy_slots WHERE id = ? AND trainer_id = ?', [slotId, trainer_id]);
    if (existingSlot.length === 0) {
      return sendError(res, 'Busy slot not found', 404);
    }
    
    // Check for overlap with other busy slots (excluding current one)
    const [conflicts] = await db.query(
      `SELECT * FROM busy_slots WHERE trainer_id = ? AND id != ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`,
      [trainer_id, slotId, end_time, start_time, start_time, end_time]
    );
    
    if (conflicts.length > 0) {
      return sendError(res, 'Busy slot overlaps with existing busy time', 409);
    }
    
    await db.query(
      'UPDATE busy_slots SET start_time = ?, end_time = ?, reason = ? WHERE id = ? AND trainer_id = ?',
      [start_time, end_time, reason || null, slotId, trainer_id]
    );
    
    // Get updated busy slot with trainer info
    const [updatedSlot] = await db.query(
      `SELECT bs.*, m.name as trainer_name, m.email as trainer_email 
       FROM busy_slots bs 
       JOIN member m ON bs.trainer_id = m.id 
       WHERE bs.id = ?`, 
      [slotId]
    );
    
    return sendSuccess(res, updatedSlot[0], 200, 'Busy slot updated successfully');
  } catch (err) {
    console.error('Error updating busy slot:', err);
    return sendError(res, 'Failed to update busy slot', 500);
  }
});

// DELETE /api/busy-slots/:id - Trainer deletes own busy slot
router.delete('/:id', auth, authorizeRole(['trainer']), async (req, res) => {
  try {
    const trainer_id = req.user.id;
    const slotId = req.params.id;
    
    // Get busy slot info before deletion
    const [existingSlot] = await db.query(
      `SELECT bs.*, m.name as trainer_name, m.email as trainer_email 
       FROM busy_slots bs 
       JOIN member m ON bs.trainer_id = m.id 
       WHERE bs.id = ? AND bs.trainer_id = ?`, 
      [slotId, trainer_id]
    );
    
    if (existingSlot.length === 0) {
      return sendError(res, 'Busy slot not found', 404);
    }
    
    await db.query('DELETE FROM busy_slots WHERE id = ? AND trainer_id = ?', [slotId, trainer_id]);
    return sendSuccess(res, { deletedBusySlot: existingSlot[0] }, 200, 'Busy slot deleted successfully');
  } catch (err) {
    console.error('Error deleting busy slot:', err);
    return sendError(res, 'Failed to delete busy slot', 500);
  }
});

module.exports = router; 