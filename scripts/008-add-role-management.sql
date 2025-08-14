-- Add role management to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'admin'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have student role by default
UPDATE users SET role = 'student' WHERE role IS NULL;

-- Make role NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
