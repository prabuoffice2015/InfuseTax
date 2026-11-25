-- ==============================================================================
-- Migration: 010_add_gst_credentials_to_users.sql
-- Description: Adds gst_login_id and gst_password columns to users table for GST portal credentials
-- Safety: Non-destructive, idempotent (ADD COLUMN IF NOT EXISTS).
-- ==============================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gst_login_id VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gst_password TEXT;
