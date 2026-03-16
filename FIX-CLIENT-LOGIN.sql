-- Fix Client Login - Run in Neon DB SQL Editor

-- First check if client exists
SELECT id, name, email, role FROM users WHERE email = 'client@tcg.com';

-- If client doesn't exist, create it
INSERT INTO users (name, email, password, role) 
VALUES ('Client User', 'client@tcg.com', '$2b$10$nFu.xNvgnVi1dR5irRIAg.XdyZJcpLEuiNzFpc/xuy98IFmosqSkG', 'client')
ON CONFLICT (email) DO UPDATE SET 
  password = '$2b$10$nFu.xNvgnVi1dR5irRIAg.XdyZJcpLEuiNzFpc/xuy98IFmosqSkG',
  name = 'Client User',
  role = 'client';

-- Verify client user
SELECT id, name, email, role FROM users WHERE email = 'client@tcg.com';

-- Check all users
SELECT id, name, email, role FROM users ORDER BY role;