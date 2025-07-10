const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (err) {
    console.error('❌ DB Test Error:', err);
    res.status(500).json({ error: 'Database test failed' });
  }
});

module.exports = router;
