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
    // Get token from Authorization header
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

    const path = event.path.replace('/.netlify/functions/tasks', '');
    const pathParts = path.split('/').filter(p => p);

    if (event.httpMethod === 'POST' && path === '') {
      // Create task
      const { title, description, priority = 'medium' } = JSON.parse(event.body);
      
      const result = await pool.query(
        'INSERT INTO tasks (title, description, priority, client_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, priority, user.id]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    if (event.httpMethod === 'GET' && path === '') {
      // Get tasks
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
      
      if (user.role === 'client') {
        query += ' WHERE t.client_id = $1';
        params = [user.id];
      } else if (user.role === 'admin') {
        query += ' WHERE t.admin_id = $1 OR t.status = $2';
        params = [user.id, 'pending'];
      } else if (user.role === 'employee') {
        query += ' WHERE t.assigned_to = $1';
        params = [user.id];
      }
      
      query += ' ORDER BY t.created_at DESC';
      
      const result = await pool.query(query, params);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }

    if (event.httpMethod === 'PUT' && pathParts.length === 2 && pathParts[1] === 'assign') {
      // Assign task
      const taskId = pathParts[0];
      const { assignedTo } = JSON.parse(event.body);
      
      const result = await pool.query(
        'UPDATE tasks SET admin_id = $1, assigned_to = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [user.id, assignedTo, 'accepted', taskId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    if (event.httpMethod === 'PUT' && pathParts.length === 2 && pathParts[1] === 'status') {
      // Update status
      const taskId = pathParts[0];
      const { status } = JSON.parse(event.body);
      
      const result = await pool.query(
        'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, taskId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    if (event.httpMethod === 'DELETE' && pathParts.length === 1) {
      // Delete task (superadmin only)
      if (user.role !== 'superadmin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Access forbidden' })
        };
      }

      const taskId = pathParts[0];
      await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Task deleted' })
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