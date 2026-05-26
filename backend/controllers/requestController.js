const pool = require('../config/database');
const { validateTransition, getAllowedTransitions } = require('../utils/workflowEngine');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, description, category, priority = 'Medium' } = req.body;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Insert request
    const requestResult = await client.query(
      `INSERT INTO requests (title, description, category, priority, user_id, status)
       VALUES ($1, $2, $3, $4, $5, 'Submitted')
       RETURNING *`,
      [title, description, category, priority, userId]
    );

    const request = requestResult.rows[0];

    // Log the creation
    await client.query(
      `INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment)
       VALUES ($1, NULL, 'Submitted', $2, $3, 'Request created')`,
      [request.id, userId, req.user.role]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

// @desc    Get all requests (with filters)
// @route   GET /api/requests
// @access  Private (Manager, Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, category, startDate, endDate, page = 1, limit = 10, sort = 'created_desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND r.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (startDate) {
      query += ` AND r.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND r.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      query.replace('SELECT r.*, u.name as user_name, u.email as user_email', 'SELECT COUNT(*)'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Add sorting
    let orderBy = 'r.created_at DESC'; // Default
    switch (sort) {
      case 'created_asc':
        orderBy = 'r.created_at ASC';
        break;
      case 'created_desc':
        orderBy = 'r.created_at DESC';
        break;
      case 'title_asc':
        orderBy = 'r.title ASC';
        break;
      case 'title_desc':
        orderBy = 'r.title DESC';
        break;
      case 'priority_high':
        orderBy = "CASE r.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END ASC";
        break;
      case 'priority_low':
        orderBy = "CASE r.priority WHEN 'Low' THEN 1 WHEN 'Medium' THEN 2 WHEN 'High' THEN 3 END ASC";
        break;
      case 'status_asc':
        orderBy = 'r.status ASC';
        break;
      default:
        orderBy = 'r.created_at DESC';
    }

    // Add pagination
    query += ` ORDER BY ${orderBy} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's own requests
// @route   GET /api/requests/my-requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort = 'created_desc' } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM requests WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Add sorting
    let orderBy = 'created_at DESC'; // Default
    switch (sort) {
      case 'created_asc':
        orderBy = 'created_at ASC';
        break;
      case 'created_desc':
        orderBy = 'created_at DESC';
        break;
      case 'title_asc':
        orderBy = 'title ASC';
        break;
      case 'title_desc':
        orderBy = 'title DESC';
        break;
      case 'priority_high':
        orderBy = "CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END ASC";
        break;
      case 'priority_low':
        orderBy = "CASE priority WHEN 'Low' THEN 1 WHEN 'Medium' THEN 2 WHEN 'High' THEN 3 END ASC";
        break;
      case 'status_asc':
        orderBy = 'status ASC';
        break;
      default:
        orderBy = 'created_at DESC';
    }

    const result = await pool.query(
      `SELECT * FROM requests 
       WHERE user_id = $1 
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = result.rows[0];

    // Check authorization
    if (req.user.role === 'User' && request.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    // Get allowed transitions for this user
    const allowedTransitions = getAllowedTransitions(request.status, req.user.role);

    res.status(200).json({
      success: true,
      data: request,
      allowedTransitions
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status: newStatus, comment } = req.body;

    await client.query('BEGIN');

    // Get current request
    const requestResult = await client.query(
      'SELECT * FROM requests WHERE id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requestResult.rows[0];
    const currentStatus = request.status;

    // Validate transition
    const validation = validateTransition(currentStatus, newStatus, req.user.role);

    if (!validation.allowed) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: validation.message
      });
    }

    // Update request status
    const updateResult = await client.query(
      'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    // Log the status change
    await client.query(
      `INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, currentStatus, newStatus, req.user.id, req.user.role, comment || null]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

// @desc    Get request logs (action history)
// @route   GET /api/requests/:id/logs
// @access  Private
exports.getRequestLogs = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists and user has access
    const requestResult = await pool.query(
      'SELECT * FROM requests WHERE id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requestResult.rows[0];

    // Check authorization
    if (req.user.role === 'User' && request.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    // Get logs
    const logsResult = await pool.query(
      `SELECT rl.*, u.name as changed_by_name, u.email as changed_by_email
       FROM request_logs rl
       LEFT JOIN users u ON rl.changed_by = u.id
       WHERE rl.request_id = $1
       ORDER BY rl.created_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      count: logsResult.rows.length,
      data: logsResult.rows
    });
  } catch (error) {
    console.error('Get request logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
