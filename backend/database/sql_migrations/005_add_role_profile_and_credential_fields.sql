-- ==============================================================================
-- Migration: 005_add_role_profile_and_credential_fields.sql
-- Description: Adds profile attributes, external credentials, and RBAC module
--              fields to users, plus an esevai_applications table.
-- Safety: Non-destructive, idempotent (ADD COLUMN IF NOT EXISTS).
-- ==============================================================================

-- 1. Add fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address_proof_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS income_tax_login_id VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS income_tax_password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_code VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '[]'::jsonb;

-- 2. Create esevai_applications table for E-Sevai services (Income, Nativity, Community, etc.)
CREATE TABLE IF NOT EXISTS public.esevai_applications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL, -- 'income', 'nativity', 'community', etc.
    applicant_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'APPROVED', 'REJECTED'
    documents_payload JSONB DEFAULT '{}'::jsonb,
    rejection_remarks TEXT,
    approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_esevai_retailer ON public.esevai_applications(retailer_id);
CREATE INDEX IF NOT EXISTS idx_esevai_customer ON public.esevai_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_esevai_tenant_status ON public.esevai_applications(tenant_id, status);
