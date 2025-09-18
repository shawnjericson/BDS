-- Add role column to app_users table
ALTER TABLE "app_users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'SELLER';

-- Add comment for role column
COMMENT ON COLUMN "app_users"."role" IS 'User role: SELLER, PROVIDER, REFERRER, MANAGER';
