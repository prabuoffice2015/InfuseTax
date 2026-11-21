-- ==============================================================================
-- Migration: 003_update_user_roles.sql
-- Description: Updates system user role identifiers:
--              - distributor -> admin (Tier 2 Admin)
--              - operator    -> customer (Tier 4 Customer)
--              - retailer    -> stays retailer (Tier 3)
--              - super_admin -> stays super_admin (Tier 1)
-- Safety: Non-destructive, idempotent update.
-- ==============================================================================

-- 1. Update Role Check Constraint on users table to allow 'admin' and 'customer'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role::text = ANY (ARRAY[
    'super_admin'::character varying, 
    'admin'::character varying, 
    'distributor'::character varying, 
    'retailer'::character varying, 
    'customer'::character varying, 
    'operator'::character varying, 
    'accountant'::character varying
]::text[]));

-- 2. Migrate existing user roles
UPDATE public.users 
SET role = 'admin' 
WHERE role = 'distributor';

UPDATE public.users 
SET role = 'customer' 
WHERE role = 'operator';
