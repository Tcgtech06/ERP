const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/auth', '');
  
  try {
    if (event.httpMethod === 'POST' && path === '/login') {
      const { email, password } = JSON.parse(event.body);
      
      console.log('Login attempt:', email);
      
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'User not found' })
        };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid password' })
        };
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token, 
          role: user.role, 
          name: user.name,
          email: user.email,
          specialization
        })
      };
    }

    if (event.httpMethod === 'POST' && path === '/register') {
      const { name, email, password, role } = JSON.parse(event.body);
      
      const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'User already exists' })
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, role]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'User registered successfully',
          user: result.rows[0]
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};