-- ==============================================================================
-- Migration: 009_create_company_bank_accounts.sql
-- Description: Company Bank Accounts & UPI QR Configuration for Super Admin & Retailer Top-Up
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch VARCHAR(100),
    account_type VARCHAR(50) DEFAULT 'CURRENT',
    upi_id VARCHAR(100),
    qr_code_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for tenant and active status
CREATE INDEX IF NOT EXISTS idx_company_bank_accounts_tenant ON public.company_bank_accounts(tenant_id, is_active);

-- Seed default initial accounts for default tenant 'a0000000-0000-0000-0000-000000000001'
INSERT INTO public.company_bank_accounts (
    id, tenant_id, bank_name, account_holder, account_number, ifsc_code, branch, account_type, upi_id, is_primary, is_active
) VALUES 
(
    'c1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'HDFC Bank',
    'TaxPartner Technologies Pvt Ltd',
    '50200012345678',
    'HDFC0001234',
    'Anna Nagar Branch, Chennai',
    'CURRENT',
    'taxpartner.retail@icici',
    true,
    true
),
(
    'c1000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'ICICI Bank',
    'TaxPartner Technologies Pvt Ltd',
    '001105009988',
    'ICIC0000011',
    'T. Nagar Branch, Chennai',
    'CURRENT',
    'taxpartner.icici@icici',
    false,
    true
),
(
    'c1000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'State Bank of India',
    'TaxPartner Technologies Pvt Ltd',
    '33445566778',
    'SBIN0004567',
    'Mount Road Branch, Chennai',
    'CURRENT',
    'taxpartner.sbi@sbi',
    false,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions to infusetax_user
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'infusetax_user') THEN
        GRANT ALL ON TABLE public.company_bank_accounts TO infusetax_user;
    END IF;
END $$;
