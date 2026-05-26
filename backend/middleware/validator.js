const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Login validation
exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Request creation validation
exports.createRequestValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Technical', 'Administrative', 'Financial', 'HR', 'Other'])
    .withMessage('Invalid category'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority')
];

// Status update validation
exports.updateStatusValidation = [
  param('id').isInt().withMessage('Invalid request ID'),
  body('status').isIn(['Submitted', 'Approved', 'Rejected', 'Needs Clarification', 'Closed', 'Reopened'])
    .withMessage('Invalid status'),
  body('comment').optional().trim()
];
