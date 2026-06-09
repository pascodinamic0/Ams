-- Demo accounts for every AMS role.
-- Password for all accounts: AMSdemo2026!
--
-- Preferred: npm run seed:demo-users (uses Supabase Admin API)
-- Or call seed_demo_auth_user() if it exists in your database.

SELECT seed_demo_auth_user('super.admin@ams.demo', 'AMSdemo2026!', 'super_admin', 'Super Admin Demo', NULL, NULL);
SELECT seed_demo_auth_user('academic.admin@ams.demo', 'AMSdemo2026!', 'academic_admin', 'Academic Admin', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('teacher@ams.demo', 'AMSdemo2026!', 'teacher', 'Demo Teacher', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('finance@ams.demo', 'AMSdemo2026!', 'finance_officer', 'Finance Officer', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('operations@ams.demo', 'AMSdemo2026!', 'operations_manager', 'Operations Manager', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('parent@ams.demo', 'AMSdemo2026!', 'parent', 'Demo Parent', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('student@ams.demo', 'AMSdemo2026!', 'student', 'Demo Student', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
SELECT seed_demo_auth_user('analytics@ams.demo', 'AMSdemo2026!', 'analytics', 'Analytics User', s.id, b.id)
FROM schools s
JOIN branches b ON b.school_id = s.id
ORDER BY s.created_at, b.created_at
LIMIT 1;
