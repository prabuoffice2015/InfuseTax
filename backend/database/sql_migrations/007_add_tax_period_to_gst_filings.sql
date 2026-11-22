-- 007_add_tax_period_to_gst_filings.sql
ALTER TABLE gst_filings ADD COLUMN IF NOT EXISTS tax_period VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_gst_filings_tax_period ON gst_filings (tax_period);
