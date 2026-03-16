const express = require('express');
const { pool } = require('../db/database');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, priority, client_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, priority, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign task
router.put('/:id/assign', auth, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET admin_id = $1, assigned_to = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [req.user.id, assignedTo, 'accepted', req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT t.*, 
             c.name as client_name, c.email as client_email,
             a.name as admin_name,
             e.name as employee_name
      FROM tasks t
      LEFT JOIN users c ON t.client_id = c.id
      LEFT JOIN users a ON t.admin_id = a.id  
      LEFT JOIN users e ON t.assigned_to = e.id
    `;
    
    let params = [];
    
    if (req.user.role === 'client') {
      query += ' WHERE t.client_id = $1';
      params = [req.user.id];
    } else if (req.user.role === 'admin') {
      query += ' WHERE t.admin_id = $1 OR t.status = $2';
      params = [req.user.id, 'pending'];
    } else if (req.user.role === 'employee' || req.user.role === 'developer') {
      query += ' WHERE t.assigned_to = $1';
      params = [req.user.id];
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, checkRole('superadmin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;