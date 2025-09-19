-- Add nickname column to app_users table
ALTER TABLE app_users ADD COLUMN nickname VARCHAR(255);

-- Add index for nickname (optional, for better search performance)
CREATE INDEX idx_app_users_nickname ON app_users(nickname);
