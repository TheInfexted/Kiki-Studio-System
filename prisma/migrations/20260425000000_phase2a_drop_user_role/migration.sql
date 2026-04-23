-- Phase 2a: Drop the User.role column and its enum.
-- The admin allowlist is now driven by the ADMIN_EMAILS env var.
-- MySQL enums are column-inline, so dropping the column removes the type too.

ALTER TABLE `User` DROP COLUMN `role`;
