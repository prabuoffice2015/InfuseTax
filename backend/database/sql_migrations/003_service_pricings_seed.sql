-- ==============================================================================
-- Migration: 003_service_pricings_seed.sql
-- Description: Ensures default government & compliance service pricings exist.
-- SAFETY: Uses ON CONFLICT DO NOTHING. Never overwrites existing customized prices.
-- ==============================================================================

INSERT INTO public.service_pricings (tenant_id, service_key, service_name, tier2_price, tier3_price, mrp_customer_fee)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'gst_registration', 'GST Registration (New GSTIN)', 950.00, 1200.00, 1500.00),
('a0000000-0000-0000-0000-000000000001', 'gstr_filing', 'GST Return Filing (GSTR-1 & 3B)', 280.00, 350.00, 500.00),
('a0000000-0000-0000-0000-000000000001', 'itr_filing', 'Income Tax (ITR) Return Filing', 450.00, 550.00, 800.00),
('a0000000-0000-0000-0000-000000000001', 'pan_card', 'PAN Card Processing Hub (Form 49A)', 70.00, 85.00, 110.00),
('a0000000-0000-0000-0000-000000000001', 'passport_seva', 'Passport & PCC Application Desk', 180.00, 220.00, 300.00),
('a0000000-0000-0000-0000-000000000001', 'govt_certificates', 'Dynamic Government Certificates', 80.00, 105.00, 150.00)
ON CONFLICT (tenant_id, service_key) DO NOTHING;
