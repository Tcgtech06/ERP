const express = require('express');
const { pool } = require('../db/database');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees
router.get('/employees', auth, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE role IN ($1, $2)', ['employee', 'developer']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', auth, checkRole('superadmin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;