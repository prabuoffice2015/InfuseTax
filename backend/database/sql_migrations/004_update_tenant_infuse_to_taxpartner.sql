-- ==============================================================================
-- Migration: 004_update_tenant_infuse_to_taxpartner.sql
-- Description: Updates root tenant code from INFUSE to TAXPARTNER.
-- Safety: Non-destructive, idempotent update.
-- ==============================================================================

UPDATE public.tenants 
SET code = 'TAXPARTNER', 
    company_name = 'TaxPartner Technologies Pvt Ltd', 
    domain = 'taxpartner.in' 
WHERE code = 'INFUSE' OR id = 'a0000000-0000-0000-0000-000000000001';
