// Workflow transition rules
const WORKFLOW_RULES = {
  'Submitted': {
    'Approved': ['Manager', 'Admin'],
    'Rejected': ['Manager', 'Admin'],
    'Needs Clarification': ['Manager', 'Admin']
  },
  'Needs Clarification': {
    'Submitted': ['User']
  },
  'Approved': {
    'Closed': ['Admin']
  },
  'Closed': {
    'Reopened': ['Admin']
  },
  'Rejected': {
    'Submitted': ['User']
  },
  'Reopened': {
    'Approved': ['Manager', 'Admin'],
    'Rejected': ['Manager', 'Admin'],
    'Closed': ['Admin']
  }
};

/**
 * Validate if a status transition is allowed
 * @param {string} currentStatus - Current status of the request
 * @param {string} newStatus - Desired new status
 * @param {string} userRole - Role of the user attempting the transition
 * @returns {Object} - { allowed: boolean, message: string }
 */
exports.validateTransition = (currentStatus, newStatus, userRole) => {
  // If status is not changing, allow it
  if (currentStatus === newStatus) {
    return {
      allowed: false,
      message: 'Status is already set to this value'
    };
  }

  // Check if current status has any allowed transitions
  if (!WORKFLOW_RULES[currentStatus]) {
    return {
      allowed: false,
      message: `No transitions allowed from status '${currentStatus}'`
    };
  }

  // Check if the desired transition exists
  if (!WORKFLOW_RULES[currentStatus][newStatus]) {
    return {
      allowed: false,
      message: `Transition from '${currentStatus}' to '${newStatus}' is not allowed`
    };
  }

  // Check if user role is authorized for this transition
  const allowedRoles = WORKFLOW_RULES[currentStatus][newStatus];
  if (!allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      message: `Role '${userRole}' is not authorized to change status from '${currentStatus}' to '${newStatus}'`
    };
  }

  return {
    allowed: true,
    message: 'Transition is valid'
  };
};

/**
 * Get allowed transitions for a given status and role
 * @param {string} currentStatus - Current status
 * @param {string} userRole - User's role
 * @returns {Array} - Array of allowed status transitions
 */
exports.getAllowedTransitions = (currentStatus, userRole) => {
  if (!WORKFLOW_RULES[currentStatus]) {
    return [];
  }

  const transitions = [];
  for (const [newStatus, allowedRoles] of Object.entries(WORKFLOW_RULES[currentStatus])) {
    if (allowedRoles.includes(userRole)) {
      transitions.push(newStatus);
    }
  }

  return transitions;
};
