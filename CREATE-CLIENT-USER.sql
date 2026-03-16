-- Create/Update Client User in Neon DB
-- Run this in your Neon DB SQL Editor

-- Insert or update client user (client@tcg.com / client@123)
INSERT INTO users (name, email, password, role) 
VALUES ('Client User', 'client@tcg.com', '$2b$10$.vuuIpOPDp7AATS70ptQH.7Kd6jkE9kC.ZS3AwehWP1fnTfyJejHC', 'client')
ON CONFLICT (email) DO UPDATE SET 
  password = '$2b$10$.vuuIpOPDp7AATS70ptQH.7Kd6jkE9kC.ZS3AwehWP1fnTfyJejHC',
  name = 'Client User',
  role = 'client';

-- Verify client user exists
SELECT id, name, email, role FROM users WHERE role = 'client';