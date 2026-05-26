# 🌱 Database Seed Data

This guide explains how to populate your database with sample data for testing.

## 📦 What Gets Created

### Users (3)
1. **John User** - `user@example.com` (Role: User)
2. **Jane Manager** - `manager@example.com` (Role: Manager)
3. **Admin User** - `admin@example.com` (Role: Admin)

**Password for all users:** `password123`

### Requests (5)

1. **New Laptop Request** (Status: Closed)
   - Complete workflow: Submitted → Approved → Closed
   - Shows full lifecycle of a request

2. **Update Office Contact Information** (Status: Needs Clarification)
   - Workflow: Submitted → Needs Clarification
   - Waiting for user to provide more details

3. **Fix Login Page Bug** (Status: Submitted)
   - Recently submitted
   - Waiting for manager review

4. **Annual Leave Request** (Status: Approved)
   - Workflow: Submitted → Approved
   - Waiting for admin to close

5. **New Office Furniture** (Status: Rejected)
   - Workflow: Submitted → Rejected
   - Shows rejection workflow

### Action Logs
- Multiple action logs for each request
- Shows status transitions
- Includes comments from users/managers/admins
- Demonstrates complete audit trail

## 🚀 How to Run

### Method 1: Using npm script (Recommended)

```bash
cd backend
npm run seed
```

### Method 2: Using psql directly

```bash
cd backend
psql -U postgres -d workflow_db -f config/seed-data.sql
```

### Method 3: Using Node.js script

```bash
cd backend
node scripts/seed.js
```

## ⚠️ Important Notes

1. **Existing Data**: The script will NOT delete existing data by default
2. **Duplicate Prevention**: Uses `ON CONFLICT DO NOTHING` for users
3. **Safe to Run**: Can be run multiple times without issues

## 🔄 Reset Database (Optional)

If you want to completely reset and start fresh:

```sql
-- Connect to database
psql -U postgres -d workflow_db

-- Run these commands
TRUNCATE TABLE request_logs CASCADE;
TRUNCATE TABLE requests CASCADE;
TRUNCATE TABLE users CASCADE;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE requests_id_seq RESTART WITH 1;
ALTER SEQUENCE request_logs_id_seq RESTART WITH 1;

-- Then run seed script
\i config/seed-data.sql
```

Or uncomment the TRUNCATE lines in `seed-data.sql` and run it.

## 📊 Verify Data

After seeding, verify the data:

```sql
-- Check users
SELECT id, name, email, role FROM users;

-- Check requests
SELECT id, title, status, priority, category FROM requests;

-- Check action logs
SELECT rl.id, rl.request_id, rl.old_status, rl.new_status, 
       u.name as changed_by, rl.role, rl.created_at 
FROM request_logs rl 
LEFT JOIN users u ON rl.changed_by = u.id 
ORDER BY rl.request_id, rl.created_at;
```

## 🧪 Testing Scenarios

After seeding, you can test:

1. **Login as User** (`user@example.com`)
   - View your 5 requests
   - See different statuses
   - Try to resubmit request #2 (Needs Clarification)

2. **Login as Manager** (`manager@example.com`)
   - View all requests
   - Approve/Reject request #3
   - Request clarification on any submitted request

3. **Login as Admin** (`admin@example.com`)
   - View all requests
   - Close request #4 (Approved)
   - Reopen request #1 (Closed)

## 📝 Sample Workflows to Test

### Complete Approval Flow
1. Login as User → Create new request
2. Login as Manager → Approve the request
3. Login as Admin → Close the request
4. Check action logs to see complete history

### Clarification Flow
1. Login as Manager → Request clarification on request #2
2. Login as User → View request #2
3. Add comment and resubmit
4. Check action logs

### Rejection Flow
1. Login as Manager → Reject a submitted request
2. Login as User → View rejected request
3. Check action logs for rejection reason

## 🎯 Expected Results

After seeding, you should see:

- **Dashboard**: Shows statistics (5 total, 2 submitted, 1 approved, 1 rejected)
- **My Requests**: User sees all 5 requests
- **All Requests**: Manager/Admin see all 5 requests
- **Action Logs**: Each request has detailed timeline
- **Filters**: Can filter by status, category, priority
- **Sorting**: Can sort by date, title, priority

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Make sure you've run the main database schema first
- Run: `psql -U postgres -d workflow_db -f config/database.sql`

### Error: "duplicate key value"
- Users already exist
- Either skip or reset database first

### Error: "password authentication failed"
- Check your `.env` file
- Verify database credentials

## 📞 Support

If you encounter issues:
1. Check database connection in `.env`
2. Verify PostgreSQL is running
3. Ensure database schema is created
4. Check console output for specific errors

---

**Happy Testing! 🎉**
