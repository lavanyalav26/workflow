const express = require('express');
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequest,
  updateRequestStatus,
  getRequestLogs
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const { createRequestValidation, updateStatusValidation, validate } = require('../middleware/validator');

const router = express.Router();

// User routes
router.post('/', protect, createRequestValidation, validate, createRequest);
router.get('/my-requests', protect, getMyRequests);

// Manager/Admin routes
router.get('/', protect, authorize('Manager', 'Admin'), getAllRequests);

// Common routes
router.get('/:id', protect, getRequest);
router.patch('/:id/status', protect, updateStatusValidation, validate, updateRequestStatus);
router.get('/:id/logs', protect, getRequestLogs);

module.exports = router;
