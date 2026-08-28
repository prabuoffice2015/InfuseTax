-- =========================================================================
-- COMPLETE MULTI-TENANT DATABASE RESET: EXACTLY 2 COMPANIES
-- =========================================================================

-- Adjust constraints for multi-tenant pricing
ALTER TABLE service_pricings DROP CONSTRAINT IF EXISTS service_pricings_service_key_key;
ALTER TABLE service_pricings DROP CONSTRAINT IF EXISTS service_pricings_tenant_service_unique;
ALTER TABLE service_pricings ADD CONSTRAINT service_pricings_tenant_service_unique UNIQUE (tenant_id, service_key);

TRUNCATE TABLE pricing_audit_logs, wallet_requests, audit_ledger, wallets, service_pricings, users, tenants CASCADE;

-- 1. INSERT EXACTLY 2 ACTIVE TENANTS
INSERT INTO tenants (id, code, company_name, domain, primary_color, secondary_color, dlt_sender_id, is_active, enabled_services, created_at, updated_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'INFUSE', 'InfuseTax Technologies Pvt Ltd', 'infusetax.com', '#2563eb', '#1e40af', 'INFUSE', true, 'gst_registration,itr_filing,gstr_filing', NOW(), NOW()),
('a0000000-0000-0000-0000-000000000002', 'APEX', 'Apex FinTech Solutions Ltd', 'apexfintech.in', '#7c3aed', '#5b21b6', 'APEXTX', true, 'gst_registration,itr_filing,gstr_filing', NOW(), NOW());

-- 2. INSERT 8 USERS WITH CLEAN HIERARCHY
-- Passwords:
-- Admin@1234: $2y$10$bcfsLTmLv7xqMyVf3Gc.0.8qnN52cWY2IIM4G7IGJhspZyGuazuuu
-- Distributor@1234: $2y$10$eyXA.gViYj7k0KsBk37cieAPaM47lafnFBzaZgl1.nrHimUuePLnC
-- Retailer@1234: $2y$10$7iDjQIcrBvT3Bg92XegJUOvRp/jfqwA5RjBJ15D.51lm67O9wJyq6
-- Operator@1234: $2y$10$34Z3KLqCZkxwHQrAyrks5Ow47huDFIN4uxE34zXq2mGriQe4CnyAa

INSERT INTO users (id, tenant_id, full_name, email, mobile, role, parent_id, city, state, password_hash, status, created_at, updated_at) VALUES
-- Company 1: INFUSE
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'InfuseTax Super Admin', 'admin@infusetax.com', '+919876500001', 'super_admin', NULL, 'Chennai', 'Tamil Nadu', '$2y$10$bcfsLTmLv7xqMyVf3Gc.0.8qnN52cWY2IIM4G7IGJhspZyGuazuuu', 'active', NOW() - INTERVAL '10 days', NOW()),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'InfuseTax Master Distributor', 'distributor@infusetax.com', '+919876500002', 'distributor', 'b0000000-0000-0000-0000-000000000001', 'Madurai', 'Tamil Nadu', '$2y$10$eyXA.gViYj7k0KsBk37cieAPaM47lafnFBzaZgl1.nrHimUuePLnC', 'active', NOW() - INTERVAL '8 days', NOW()),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Ramesh Digital Seva (Retailer)', 'retailer@infusetax.com', '+919876500003', 'retailer', 'b0000000-0000-0000-0000-000000000002', 'Coimbatore', 'Tamil Nadu', '$2y$10$7iDjQIcrBvT3Bg92XegJUOvRp/jfqwA5RjBJ15D.51lm67O9wJyq6', 'active', NOW() - INTERVAL '6 days', NOW()),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Salem Prime Retailer Seva', 'salem.retailer@infusetax.com', '+919842188888', 'retailer', 'b0000000-0000-0000-0000-000000000002', 'Salem', 'Tamil Nadu', '$2y$10$7iDjQIcrBvT3Bg92XegJUOvRp/jfqwA5RjBJ15D.51lm67O9wJyq6', 'active', NOW() - INTERVAL '5 days', NOW()),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Counter Staff (Operator)', 'operator@infusetax.com', '+919876500004', 'operator', 'b0000000-0000-0000-0000-000000000002', 'Coimbatore', 'Tamil Nadu', '$2y$10$34Z3KLqCZkxwHQrAyrks5Ow47huDFIN4uxE34zXq2mGriQe4CnyAa', 'active', NOW() - INTERVAL '4 days', NOW()),

-- Company 2: APEX
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Apex Zonal Master Distributor', 'apex.dist@infusetax.com', '+919876500006', 'distributor', 'b0000000-0000-0000-0000-000000000001', 'Trichy', 'Tamil Nadu', '$2y$10$eyXA.gViYj7k0KsBk37cieAPaM47lafnFBzaZgl1.nrHimUuePLnC', 'active', NOW() - INTERVAL '7 days', NOW()),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Apex CSC Tax Desk (Retailer)', 'apex.retailer@infusetax.com', '+919876500007', 'retailer', 'b0000000-0000-0000-0000-000000000006', 'Trichy', 'Tamil Nadu', '$2y$10$7iDjQIcrBvT3Bg92XegJUOvRp/jfqwA5RjBJ15D.51lm67O9wJyq6', 'active', NOW() - INTERVAL '5 days', NOW()),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'Apex Counter Operator Staff', 'apex.operator@infusetax.com', '+919876500008', 'operator', 'b0000000-0000-0000-0000-000000000006', 'Trichy', 'Tamil Nadu', '$2y$10$34Z3KLqCZkxwHQrAyrks5Ow47huDFIN4uxE34zXq2mGriQe4CnyAa', 'active', NOW() - INTERVAL '3 days', NOW());

-- 3. INSERT WALLETS FOR ALL 8 USERS
INSERT INTO wallets (user_id, tenant_id, balance, currency, updated_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2500000.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 450000.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 48750.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 15000.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 20400.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 380000.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 32000.00, 'INR', NOW()),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 8500.00, 'INR', NOW());

-- 4. INSERT SERVICE PRICINGS FOR BOTH TENANTS (5 SERVICES TOTAL)
INSERT INTO service_pricings (id, tenant_id, service_key, service_name, tier2_price, tier3_price, mrp_customer_fee, updated_at) VALUES
-- INFUSE Pricing (5 Services)
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'gst_reg_sole_prop', 'GST Registration (Sole Proprietorship - 1a)', 900.00, 1100.00, 1500.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'gst_reg_pvt_ltd', 'GST Registration (Private Limited Company - 1b)', 1500.00, 1800.00, 2500.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'gst_reg_llp', 'GST Registration (Partnership Firm / LLP - 1c)', 1200.00, 1500.00, 2000.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'itr_filing', 'Income Tax (IT) Filing (Individual & Business)', 450.00, 550.00, 800.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'gstr_filing', 'GST Return Filing (GSTR-1 & 3B)', 280.00, 350.00, 500.00, NOW()),

-- APEX Pricing (5 Services)
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'gst_reg_sole_prop', 'GST Registration (Sole Proprietorship - 1a)', 920.00, 1150.00, 1500.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'gst_reg_pvt_ltd', 'GST Registration (Private Limited Company - 1b)', 1550.00, 1850.00, 2500.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'gst_reg_llp', 'GST Registration (Partnership Firm / LLP - 1c)', 1250.00, 1550.00, 2000.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'itr_filing', 'Income Tax (IT) Filing (Individual & Business)', 480.00, 580.00, 850.00, NOW()),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'gstr_filing', 'GST Return Filing (GSTR-1 & 3B)', 300.00, 380.00, 550.00, NOW());

-- 5. INSERT WALLET REQUESTS (UTR & FLOAT)
INSERT INTO wallet_requests (id, tenant_id, requester_id, requester_role, target_approver_role, amount, payment_mode, reference_no, status, remarks, created_at, approved_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'retailer', 'distributor', 25000.00, 'BANK_UTR', 'UTR998811223344', 'pending', 'Advance top-up for monthly GST filing rush', NOW() - INTERVAL '4 hours', NULL),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'operator', 'distributor', 5000.00, 'CASH_COUNTER', 'CASH-REC-001', 'pending', 'Counter shift float top-up', NOW() - INTERVAL '2 hours', NULL),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'retailer', 'distributor', 15000.00, 'BANK_UTR', 'UTR776655443322', 'approved', 'Weekend ITR advance verified', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007', 'retailer', 'distributor', 30000.00, 'BANK_UTR', 'APEX-UTR-44332211', 'pending', 'Apex CSC monthly liquidity allocation', NOW() - INTERVAL '1 hour', NULL),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'operator', 'distributor', 4000.00, 'CASH_COUNTER', 'CASH-SHIFT-APEX', 'approved', 'Apex shift float approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- 6. INSERT PRICING AUDIT LOGS
INSERT INTO pricing_audit_logs (tenant_id, service_key, service_name, updated_by_id, updated_by_name, updated_by_role, user_tier, old_tier2_price, new_tier2_price, old_tier3_price, new_tier3_price, old_mrp_fee, new_mrp_fee, action_type, remarks, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'pan_card', 'PAN Card Processing Hub (Form 49A)', 'b0000000-0000-0000-0000-000000000001', 'InfuseTax Super Admin', 'super_admin', 'Tier 1', 70.00, 75.00, 85.00, 85.00, 110.00, 120.00, 'TIER2_PRICE_UPDATE', 'UTIITSL processing cost revision (₹70 → ₹75)', NOW() - INTERVAL '3 days'),
('a0000000-0000-0000-0000-000000000001', 'itr_filing', 'Income Tax (ITR) Return Filing', 'b0000000-0000-0000-0000-000000000002', 'InfuseTax Master Distributor', 'distributor', 'Tier 2', 450.00, 450.00, 520.00, 550.00, 800.00, 800.00, 'TIER3_PRICE_UPDATE', 'Form 16 OCR automated batch pricing set for Tier 3 network', NOW() - INTERVAL '2 days'),
('a0000000-0000-0000-0000-000000000002', 'gst_registration', 'GST Registration (New GSTIN)', 'b0000000-0000-0000-0000-000000000001', 'InfuseTax Super Admin', 'super_admin', 'Tier 1', 900.00, 950.00, 1200.00, 1200.00, 1500.00, 1600.00, 'TIER2_PRICE_UPDATE', 'Base rate tuned for Apex FinTech node', NOW() - INTERVAL '1 day');

-- 7. INSERT MASTER AUDIT LEDGER RECORDS
INSERT INTO audit_ledger (id, tenant_id, reference_id, actor_id, action_type, debit_user_id, credit_user_id, amount, balance_after, narration, created_at) VALUES
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'TXN-UTR-90812', 'b0000000-0000-0000-0000-000000000001', 'BANK_UTR_CREDIT', NULL, 'b0000000-0000-0000-0000-000000000003', 15000.00, 48750.00, 'Bank Deposit Approval UTR 776655443322 credited to Ramesh Digital Seva', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'P2P-DISB-1092', 'b0000000-0000-0000-0000-000000000002', 'P2P_DISBURSAL', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 15000.00, 15000.00, 'Instant float allocation to Salem Prime Retailer', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'AA3308269601150Z', 'b0000000-0000-0000-0000-000000000003', 'GST_REGISTRATION_DEBIT', 'b0000000-0000-0000-0000-000000000003', NULL, 1150.00, 47600.00, 'GST Registration filing fee for Balaji Silks (ARN: AA3308269601150Z)', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000002', 'TXN-P2P-APEX-01', 'b0000000-0000-0000-0000-000000000006', 'P2P_DISBURSAL', 'b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 32000.00, 32000.00, 'Direct float allocation from Apex Distributor to Apex CSC', NOW() - INTERVAL '5 days');
