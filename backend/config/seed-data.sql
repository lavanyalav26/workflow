-- ============================================
-- Create Tables
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('User', 'Manager', 'Admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Rejected', 'Needs Clarification', 'Closed', 'Reopened')),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_logs (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(20),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Seed Users (password: password123)
-- ============================================

INSERT INTO users (name, email, password, role) VALUES
  ('John User',    'user@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User'),
  ('Jane Manager', 'manager@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager'),
  ('Admin User',   'admin@example.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Seed Requests
-- ============================================

INSERT INTO requests (title, description, category, priority, status, user_id) VALUES
  ('New Laptop Request',                 'Need a new laptop for development work.',          'IT',        'High',   'Closed',              (SELECT id FROM users WHERE email = 'user@example.com')),
  ('Update Office Contact Information',  'Need to update the office contact details.',       'Admin',     'Low',    'Needs Clarification', (SELECT id FROM users WHERE email = 'user@example.com')),
  ('Fix Login Page Bug',                 'Login page throws error on wrong password.',       'IT',        'High',   'Submitted',           (SELECT id FROM users WHERE email = 'user@example.com')),
  ('Annual Leave Request',               'Requesting annual leave for next month.',          'HR',        'Medium', 'Approved',            (SELECT id FROM users WHERE email = 'user@example.com')),
  ('New Office Furniture',               'Request for new chairs and desks for the team.',  'Facilities','Low',    'Rejected',            (SELECT id FROM users WHERE email = 'user@example.com'));

-- ============================================
-- Seed Request Logs
-- ============================================

-- Request 1: Submitted → Approved → Closed
INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment) VALUES
  ((SELECT id FROM requests WHERE title = 'New Laptop Request'), NULL,        'Submitted', (SELECT id FROM users WHERE email = 'user@example.com'),    'User',    'Request created'),
  ((SELECT id FROM requests WHERE title = 'New Laptop Request'), 'Submitted', 'Approved',  (SELECT id FROM users WHERE email = 'manager@example.com'), 'Manager', 'Approved. Valid request.'),
  ((SELECT id FROM requests WHERE title = 'New Laptop Request'), 'Approved',  'Closed',    (SELECT id FROM users WHERE email = 'admin@example.com'),   'Admin',   'Laptop delivered and closed.');

-- Request 2: Submitted → Needs Clarification
INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment) VALUES
  ((SELECT id FROM requests WHERE title = 'Update Office Contact Information'), NULL,        'Submitted',           (SELECT id FROM users WHERE email = 'user@example.com'),    'User',    'Request created'),
  ((SELECT id FROM requests WHERE title = 'Update Office Contact Information'), 'Submitted', 'Needs Clarification', (SELECT id FROM users WHERE email = 'manager@example.com'), 'Manager', 'Please provide the new contact details.');

-- Request 3: Submitted
INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment) VALUES
  ((SELECT id FROM requests WHERE title = 'Fix Login Page Bug'), NULL, 'Submitted', (SELECT id FROM users WHERE email = 'user@example.com'), 'User', 'Request created');

-- Request 4: Submitted → Approved
INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment) VALUES
  ((SELECT id FROM requests WHERE title = 'Annual Leave Request'), NULL,        'Submitted', (SELECT id FROM users WHERE email = 'user@example.com'),    'User',    'Request created'),
  ((SELECT id FROM requests WHERE title = 'Annual Leave Request'), 'Submitted', 'Approved',  (SELECT id FROM users WHERE email = 'manager@example.com'), 'Manager', 'Leave approved.');

-- Request 5: Submitted → Rejected
INSERT INTO request_logs (request_id, old_status, new_status, changed_by, role, comment) VALUES
  ((SELECT id FROM requests WHERE title = 'New Office Furniture'), NULL,        'Submitted', (SELECT id FROM users WHERE email = 'user@example.com'),    'User',    'Request created'),
  ((SELECT id FROM requests WHERE title = 'New Office Furniture'), 'Submitted', 'Rejected',  (SELECT id FROM users WHERE email = 'manager@example.com'), 'Manager', 'Budget not available this quarter.');
