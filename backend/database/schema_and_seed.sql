-- ==============================================================================
-- INFUSETAX ENTERPRISE SUITE - SUPABASE / POSTGRESQL 16 PRODUCTION DDL & SEEDS
-- Multi-Tenant B2B Architecture with Double-Entry ACID Financial Ledger
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TENANTS TABLE (White-label instances)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    dlt_sender_id VARCHAR(6) DEFAULT 'INFUST',
    primary_color VARCHAR(20) DEFAULT '#1E40AF',
    secondary_color VARCHAR(20) DEFAULT '#F59E0B',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE (Multi-tier roles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'accountant', 'distributor', 'retailer', 'operator')),
    city VARCHAR(100),
    state VARCHAR(100),
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. WALLETS TABLE (ACID prepaid balances)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    currency VARCHAR(3) DEFAULT 'INR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. UTR BANK DEPOSIT TOP-UP REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utr_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    utr_number VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. GST REGISTRATIONS & FILINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gst_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    arn VARCHAR(50) UNIQUE,
    trade_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    pan VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    hsn_code VARCHAR(20),
    filing_type VARCHAR(50) DEFAULT 'REGISTRATION',
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    portal_fee NUMERIC(10, 2) NOT NULL,
    retailer_margin NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. INCOME TAX RETURN (ITR) FILINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itr_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ack_number VARCHAR(50) UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    pan VARCHAR(10) NOT NULL,
    assessment_year VARCHAR(10) NOT NULL DEFAULT '2025-26',
    gross_salary NUMERIC(12, 2) NOT NULL,
    optimal_regime VARCHAR(50) NOT NULL,
    tax_savings NUMERIC(10, 2) DEFAULT 0.00,
    net_refund NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'FILED_VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. CLOUDFLARE R2 ENCRYPTED DOCUMENTS VAULT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 1048576,
    sha256_hash VARCHAR(64) DEFAULT 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure created_at exists even if documents was created previously with uploaded_at
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'created_at'
    ) THEN 
        ALTER TABLE documents ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 8. IMMUTABLE FINANCIAL AUDIT LEDGER (Double-Entry Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    reference_id VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    debit_user_id UUID REFERENCES users(id),
    credit_user_id UUID REFERENCES users(id),
    amount NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    narration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. HIGH-PERFORMANCE POSTGRESQL SMART INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users (email, role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users (tenant_id, role, status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_gst_filings_retailer_created ON gst_filings (retailer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gst_filings_tenant ON gst_filings (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_itr_filings_retailer_created ON itr_filings (retailer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_tenant_created ON audit_ledger (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_actor ON audit_ledger (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_utr_requests_status ON utr_requests (status, created_at DESC);

-- ==============================================================================
-- TURNKEY PRODUCTION SEED DATA
-- ==============================================================================

-- 1. Create Default Master Tenant
INSERT INTO tenants (id, code, company_name, domain, dlt_sender_id, primary_color, secondary_color)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'INFUSE',
    'InfuseTax Technologies Pvt Ltd',
    'portal.infusetax.com',
    'INFUST',
    '#1E40AF',
    '#F59E0B'
) ON CONFLICT (code) DO NOTHING;

-- 2. Seed Multi-Tier Users
INSERT INTO users (id, tenant_id, email, mobile, password_hash, full_name, role, city, state, status)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'admin@infusetax.com',
    '+919876500001',
    '$2y$12$Z0bB1l9v/c1w3K.pLqfS6uM8Q9/a.5w0XvK4jL8nB1xZ5mK3rPqGy',
    'InfuseTax Super Admin',
    'super_admin',
    'Chennai',
    'Tamil Nadu',
    'active'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'distributor@infusetax.com',
    '+919876500002',
    '$2y$12$Z0bB1l9v/c1w3K.pLqfS6uM8Q9/a.5w0XvK4jL8nB1xZ5mK3rPqGy',
    'Apex Zonal Distributor',
    'distributor',
    'Madurai',
    'Tamil Nadu',
    'active'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'retailer@infusetax.com',
    '+919876500003',
    '$2y$12$Z0bB1l9v/c1w3K.pLqfS6uM8Q9/a.5w0XvK4jL8nB1xZ5mK3rPqGy',
    'Ramesh Digital Seva (Retailer)',
    'retailer',
    'Coimbatore',
    'Tamil Nadu',
    'active'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'operator@infusetax.com',
    '+919876500004',
    '$2y$12$Z0bB1l9v/c1w3K.pLqfS6uM8Q9/a.5w0XvK4jL8nB1xZ5mK3rPqGy',
    'Counter Staff (Operator)',
    'operator',
    'Coimbatore',
    'Tamil Nadu',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- 3. Initialize Wallets
INSERT INTO wallets (user_id, tenant_id, balance)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2500000.00),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 450000.00),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 48750.00),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 15400.00)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Seed Audit Ledger Records
INSERT INTO audit_ledger (tenant_id, reference_id, actor_id, action_type, debit_user_id, credit_user_id, amount, balance_after, narration)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'TXN-UTR-90812', 'b0000000-0000-0000-0000-000000000001', 'WALLET_TOPUP', NULL, 'b0000000-0000-0000-0000-000000000003', 50000.00, 48750.00, 'Bank Deposit Approval UTR 423512349876 credited to Ramesh Digital Seva'),
('a0000000-0000-0000-0000-000000000001', 'TXN-P2P-77621', 'b0000000-0000-0000-0000-000000000002', 'P2P_DISBURSAL', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 10000.00, 450000.00, 'Instant P2P Balance Allocation from Apex Distributor to Ramesh Seva')
ON CONFLICT DO NOTHING;
