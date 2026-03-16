const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/database');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email); // Debug log
    
    // Allow login with email OR employee ID
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    console.log('User found:', user ? user.email : 'None'); // Debug log

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch); // Debug log

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Determine specialization for employees
    let specialization = null;
    if (user.role === 'employee') {
      if (user.email === 'TD001' || user.name.includes('Digital Marketing')) {
        specialization = 'Digital Marketing';
      } else if (user.email === 'TT001' || user.name.includes('Software')) {
        specialization = 'Software Development';
      } else if (user.email === 'TB001' || user.name.includes('BDO')) {
        specialization = 'BDO';
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, specialization }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      role: user.role, 
      name: user.name,
      email: user.email,
      specialization
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;