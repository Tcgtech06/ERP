-- FINAL SQL COMMANDS FOR NEON DB
-- Copy and paste these into your Neon DB SQL Editor
-- Go to: https://console.neon.tech/app/projects

-- Digital Marketing Employee (TD001 / TCGD202601)
INSERT INTO users (name, email, password, role) VALUES ('Digital Marketing Employee', 'TD001', '$2b$10$RjOqks0fhjPxNkUnTqas5OU.PhDKpk3IzHoys5NZC9dgt0eyzqes.', 'employee')
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$RjOqks0fhjPxNkUnTqas5OU.PhDKpk3IzHoys5NZC9dgt0eyzqes.', name = 'Digital Marketing Employee';

-- Software Employee (TT001 / TCGT202601)
INSERT INTO users (name, email, password, role) VALUES ('Software Employee', 'TT001', '$2b$10$VoPKn1g1tjaUkKjW/f.KR.8JLm1HnynMYoMRTi8KMMA2M2m56GfVO', 'employee')
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$VoPKn1g1tjaUkKjW/f.KR.8JLm1HnynMYoMRTi8KMMA2M2m56GfVO', name = 'Software Employee';

-- Admin (TCGadmin01 / admin@01)
INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'TCGadmin01', '$2b$10$S8v9ExZdbBCI.ES/QTDHruZlTRXk8SxvPbeyAoc/3d0X2oFwfV6MS', 'admin')
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$S8v9ExZdbBCI.ES/QTDHruZlTRXk8SxvPbeyAoc/3d0X2oFwfV6MS';

-- Super Admin (superadmin@tcg.com / tcgtech@01)
UPDATE users SET password = '$2b$10$a/VlJI.xR7mBsBKjTHicnewgywmjC8r0ovoFwzgX5SAVkjbc.YQzS' WHERE email = 'superadmin@tcg.com';

-- BDO (TB001 / TCGB202601)
INSERT INTO users (name, email, password, role) VALUES ('BDO User', 'TB001', '$2b$10$5GTrZYw.04MziYa0/NOclehMrrJiB441k34qxkHNmI.pJJ78sObV2', 'bdo')
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$5GTrZYw.04MziYa0/NOclehMrrJiB441k34qxkHNmI.pJJ78sObV2';

-- Developer (developer@tcg.com / dev@123)
UPDATE users SET password = '$2b$10$2CM4xa7P/NbpR74a/wS6hOmgOzoIK.nILxXFG80HHOAw9BqEl9lTu' WHERE email = 'developer@tcg.com';

-- Client (client@tcg.com / client@123)
UPDATE users SET password = '$2b$10$.vuuIpOPDp7AATS70ptQH.7Kd6jkE9kC.ZS3AwehWP1fnTfyJejHC' WHERE email = 'client@tcg.com';

-- Verify all users
SELECT id, name, email, role FROM users ORDER BY role;
