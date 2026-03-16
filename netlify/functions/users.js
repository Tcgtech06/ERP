const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const auth = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Access denied' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const user = auth(token);

    const path = event.path.replace('/.netlify/functions/users', '');

    if (event.httpMethod === 'GET' && path === '') {
      // Get all users (admin/superadmin only)
      if (!['admin', 'superadmin'].includes(user.role)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Access forbidden' })
        };
      }

      const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }

    if (event.httpMethod === 'GET' && path === '/employees') {
      // Get employees
      if (!['admin', 'superadmin'].includes(user.role)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Access forbidden' })
        };
      }

      const result = await pool.query('SELECT id, name, email FROM users WHERE role = $1', ['employee']);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete user (superadmin only)
      if (user.role !== 'superadmin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Access forbidden' })
        };
      }

      const userId = path.replace('/', '');
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'User deleted' })
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