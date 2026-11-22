-- ==============================================================================
-- Migration: 008_sync_customer_invoices_and_parent_id.sql
-- Description: Backfills retailer_id on customer_invoices from users.parent_id
--              and synchronizes month column with invoice_date
-- ==============================================================================

-- 1. Sync retailer_id on customer_invoices with customer's assigned retailer (parent_id)
UPDATE public.customer_invoices ci
SET retailer_id = u.parent_id,
    updated_at = CURRENT_TIMESTAMP
FROM public.users u
WHERE ci.customer_id = u.id 
  AND (ci.retailer_id IS NULL OR ci.retailer_id != u.parent_id) 
  AND u.parent_id IS NOT NULL;

-- 2. Normalize month column to match invoice_date format YYYY-MM
UPDATE public.customer_invoices
SET month = to_char(invoice_date, 'YYYY-MM'),
    updated_at = CURRENT_TIMESTAMP
WHERE to_char(invoice_date, 'YYYY-MM') != month;

-- 3. Add composite index for quick lookup
CREATE INDEX IF NOT EXISTS idx_customer_invoices_ret_date 
ON public.customer_invoices(retailer_id, invoice_date);
