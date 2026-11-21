-- ==============================================================================
-- Migration: 001_core_schema.sql
-- Description: Idempotent base schema creation for all 13 core tables.
-- SAFETY: Uses CREATE TABLE IF NOT EXISTS and ON CONFLICT DO NOTHING.
-- Existing live data is 100% PRESERVED.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    code character varying(50) UNIQUE NOT NULL,
    company_name character varying(255) NOT NULL,
    domain character varying(255) UNIQUE NOT NULL,
    dlt_sender_id character varying(6) DEFAULT 'INFUST'::character varying,
    primary_color character varying(20) DEFAULT '#1E40AF'::character varying,
    secondary_color character varying(20) DEFAULT '#F59E0B'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    enabled_services text,
    logo_url character varying(500),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    whatsapp_enabled boolean DEFAULT false,
    whatsapp_config jsonb DEFAULT '{}'::jsonb
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    email character varying(255) UNIQUE NOT NULL,
    mobile character varying(15) UNIQUE NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    city character varying(100),
    state character varying(100),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    parent_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    security_pin character varying(6),
    permissions jsonb DEFAULT '[]'::jsonb,
    whatsapp_enabled boolean DEFAULT true
);

-- 3. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    currency character varying(3) DEFAULT 'INR'::character varying,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 4. UTR BANK TOPUP REQUESTS
CREATE TABLE IF NOT EXISTS public.utr_requests (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    bank_name character varying(100) NOT NULL,
    utr_number character varying(100) UNIQUE NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid REFERENCES public.users(id),
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 5. GST FILINGS
CREATE TABLE IF NOT EXISTS public.gst_filings (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    retailer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    arn character varying(50) UNIQUE,
    trade_name character varying(255) NOT NULL,
    legal_name character varying(255) NOT NULL,
    entity_type character varying(50) NOT NULL,
    pan character varying(10) NOT NULL,
    state character varying(50) NOT NULL,
    hsn_code character varying(20),
    filing_type character varying(50) DEFAULT 'REGISTRATION'::character varying,
    status character varying(30) DEFAULT 'SUBMITTED'::character varying,
    portal_fee numeric(10,2) NOT NULL,
    retailer_margin numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    operator_id uuid REFERENCES public.users(id),
    documents_payload jsonb DEFAULT '{}'::jsonb,
    approver_id uuid REFERENCES public.users(id),
    verified_doc_url text,
    rejection_remarks text,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone
);

-- 6. ITR FILINGS
CREATE TABLE IF NOT EXISTS public.itr_filings (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    retailer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    ack_number character varying(50) UNIQUE,
    client_name character varying(255) NOT NULL,
    pan character varying(10) NOT NULL,
    assessment_year character varying(10) DEFAULT '2025-26'::character varying NOT NULL,
    itr_form character varying(20) DEFAULT 'ITR-1'::character varying,
    gross_salary numeric(12,2) NOT NULL,
    optimal_regime character varying(50) NOT NULL,
    tax_savings numeric(10,2) DEFAULT 0.00,
    net_refund numeric(10,2) DEFAULT 0.00,
    status character varying(30) DEFAULT 'FILED_VERIFIED'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    operator_id uuid REFERENCES public.users(id),
    documents_payload jsonb DEFAULT '{}'::jsonb,
    approver_id uuid REFERENCES public.users(id),
    verified_doc_url text,
    rejection_remarks text,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    mobile character varying(20),
    email character varying(100),
    bank_period character varying(50),
    portal_fee numeric(10,2) DEFAULT 450.00,
    retailer_margin numeric(10,2) DEFAULT 100.00
);

-- 7. DOCUMENTS VAULT
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    file_name character varying(255) NOT NULL,
    file_size_kb integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    r2_storage_key character varying(500) NOT NULL,
    encryption_algorithm character varying(50) DEFAULT 'AES-256-GCM'::character varying,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LEDGER (Double-Entry Financial Transactions)
CREATE TABLE IF NOT EXISTS public.audit_ledger (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    reference_id character varying(100) NOT NULL,
    actor_id uuid REFERENCES public.users(id),
    action_type character varying(50) NOT NULL,
    debit_user_id uuid REFERENCES public.users(id),
    credit_user_id uuid REFERENCES public.users(id),
    amount numeric(15,2) NOT NULL,
    balance_after numeric(15,2) NOT NULL,
    narration text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 9. SERVICE PRICINGS
CREATE TABLE IF NOT EXISTS public.service_pricings (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_key character varying(50) NOT NULL,
    service_name character varying(100) NOT NULL,
    tier2_price numeric(10,2) NOT NULL,
    tier3_price numeric(10,2) NOT NULL,
    mrp_customer_fee numeric(10,2) NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_pricings_tenant_service_unique UNIQUE (tenant_id, service_key)
);

-- 10. WALLET REQUESTS
CREATE TABLE IF NOT EXISTS public.wallet_requests (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    requester_role character varying(50) NOT NULL,
    target_approver_role character varying(50) NOT NULL,
    approver_id uuid REFERENCES public.users(id),
    amount numeric(12,2) NOT NULL,
    payment_mode character varying(50) DEFAULT 'UTR'::character varying,
    reference_no character varying(100),
    proof_doc_url text,
    status character varying(20) DEFAULT 'pending'::character varying,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp with time zone
);

-- 11. PRICING AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.pricing_audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_key character varying(50) NOT NULL,
    service_name character varying(100) NOT NULL,
    updated_by_id uuid REFERENCES public.users(id),
    updated_by_name character varying(100) NOT NULL,
    updated_by_role character varying(50) NOT NULL,
    user_tier character varying(20) NOT NULL,
    old_tier2_price numeric(10,2),
    new_tier2_price numeric(10,2),
    old_tier3_price numeric(10,2),
    new_tier3_price numeric(10,2),
    old_mrp_fee numeric(10,2),
    new_mrp_fee numeric(10,2),
    action_type character varying(50) NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    target_role character varying(50) DEFAULT 'all'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    category character varying(50) DEFAULT 'general'::character varying NOT NULL,
    reference_id character varying(100),
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 13. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    title character varying(255) NOT NULL,
    category character varying(50) DEFAULT 'ANNOUNCEMENT'::character varying NOT NULL,
    message text NOT NULL,
    due_date character varying(100),
    urgency character varying(20) DEFAULT 'UPCOMING'::character varying NOT NULL,
    target_tiers character varying(50) DEFAULT 'all'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES (Idempotent)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_audit_ledger_actor ON public.audit_ledger (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_created ON public.audit_ledger (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_tenant_created ON public.audit_ledger (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON public.documents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_uploaded ON public.documents (user_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gst_filings_pan ON public.gst_filings (pan);
CREATE INDEX IF NOT EXISTS idx_gst_filings_retailer_created ON public.gst_filings (retailer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gst_filings_tenant ON public.gst_filings (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_itr_filings_pan ON public.itr_filings (pan);
CREATE INDEX IF NOT EXISTS idx_itr_filings_retailer_created ON public.itr_filings (retailer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_role ON public.notifications (tenant_id, target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_audit_service ON public.pricing_audit_logs (service_key);
CREATE INDEX IF NOT EXISTS idx_pricing_audit_tenant ON public.pricing_audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email_role ON public.users (email, role);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON public.users (tenant_id, role, status);
CREATE INDEX IF NOT EXISTS idx_utr_requests_status ON public.utr_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_requests_status ON public.wallet_requests (status, requester_role);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets (user_id);

-- ==============================================================================
-- SEED INITIAL MASTER TENANT (Only if missing - ON CONFLICT DO NOTHING)
-- ==============================================================================
INSERT INTO public.tenants (id, code, company_name, domain, dlt_sender_id, primary_color, secondary_color)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'INFUSE',
    'TaxPartner Technologies Pvt Ltd',
    'taxpartner.in',
    'INFUST',
    '#1E40AF',
    '#F59E0B'
) ON CONFLICT (code) DO NOTHING;
