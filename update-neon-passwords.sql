-- Run these commands in Neon DB SQL Editor to update passwords
-- Go to: https://console.neon.tech/app/projects

-- Update Super Admin password to 'admin123'
UPDATE users SET password = '$2a$10$z3g5sZsMb7x2aOpVff56SuU5782jLLj8RXp2Tak6xy/Xkg1.Ata/a' WHERE email = 'superadmin@tcg.com';

-- Update Developer password to 'dev123'
UPDATE users SET password = '$2a$10$EcmAjZFhSnqe8Bez9MC8b.bHz7o/U7a1fwqxWY/pgpWHifs099JlC' WHERE email = 'developer@tcg.com';

-- Update BDO password to 'bdo123'
UPDATE users SET password = '$2a$10$suBiwUsPJQRWlPBwkXLuWOEf69.2HKXztvqTQ05dFbw0hzbn7QG5u' WHERE email = 'bdo@tcg.com';

-- Update Client password to 'client123'
UPDATE users SET password = '$2a$10$Mx8r4ZrnHtVFlRIJlQDl4u8WhkwPsT4M3n8NNj9aSiGGawJgXvC7i' WHERE email = 'client@tcg.com';

-- Update Admin password to 'admin123'
UPDATE users SET password = '$2a$10$wWR5npqZbZHUxTGLfzCjbed0QFGKwEETZ9kulT9Nna9AjWFgz8g1i' WHERE email = 'admin@tcg.com';

-- Update Employee password to 'emp123'
UPDATE users SET password = '$2a$10$69jDmoKzZXD4LWYhEJPeIOIzyBH/xael/0nNtc2EpQ6b1mvB69UvW' WHERE email = 'employee@tcg.com';

-- Verify all users
SELECT id, name, email, role FROM users;
