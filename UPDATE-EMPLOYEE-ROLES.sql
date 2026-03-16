-- Update all employees to have 'employee' role in Neon DB
-- Run these commands in your Neon DB SQL Editor

-- Update Digital Marketing Employee (TD001 / TCGD202601)
UPDATE users SET role = 'employee', name = 'Digital Marketing Employee' WHERE email = 'TD001';

-- Update Software Employee (TT001 / TCGT202601) 
UPDATE users SET role = 'employee', name = 'Software Employee' WHERE email = 'TT001';

-- Update BDO Employee (TB001 / TCGB202601)
UPDATE users SET role = 'employee', name = 'BDO Employee' WHERE email = 'TB001';

-- Remove old developer role if exists
DELETE FROM users WHERE email = 'developer@tcg.com' AND role = 'developer';

-- Verify all users
SELECT id, name, email, role FROM users ORDER BY role, name;