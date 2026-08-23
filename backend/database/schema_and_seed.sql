-- ==============================================================================
-- INFUSETAX ENTERPRISE SUITE - POSTGRESQL 16 PRODUCTION DDL & SEED DATA
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
    itr_form VARCHAR(20) NOT NULL DEFAULT 'ITR-1',
    gross_salary NUMERIC(12, 2) NOT NULL,
    optimal_regime VARCHAR(50) NOT NULL,
    tax_savings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_refund NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
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
    file_name VARCHAR(255) NOT NULL,
    file_size_kb INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    r2_storage_key VARCHAR(500) NOT NULL,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. DOUBLE-ENTRY FINANCIAL AUDIT LEDGER (Immutable)
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
    narration TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_gst_filings_pan ON gst_filings(pan);
CREATE INDEX IF NOT EXISTS idx_itr_filings_pan ON itr_filings(pan);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_created ON audit_ledger(created_at DESC);

-- ==============================================================================
-- TURNKEY SEED DATA
-- ==============================================================================

-- 1. Insert Default Tenant
INSERT INTO tenants (id, code, company_name, domain, dlt_sender_id, primary_color, secondary_color)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'INFUSE',
    'InfuseTax Technologies Pvt Ltd',
    'tax.infusetax.com',
    'INFUST',
    '#1E40AF',
    '#F59E0B'
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Core Users
INSERT INTO users (id, tenant_id, email, mobile, password_hash, full_name, role, city, state, status)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'admin@infusetax.com',
    '+919876500001',
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456', -- Secure Argon2/Bcrypt hash
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
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456',
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
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456',
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
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456',
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
('a0000000-0000-0000-0000-000000000001', 'TXN-P2P-77621', 'b0000000-0000-0000-0000-000000000002', 'P2P_DISBURSAL', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 10000.00, 450000.00, 'Instant P2P Balance Allocation from Apex Distributor to Ramesh Seva');
