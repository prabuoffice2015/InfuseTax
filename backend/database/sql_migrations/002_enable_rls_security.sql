-- ==============================================================================
-- Migration: 002_enable_rls_security.sql
-- Description: Idempotent Row-Level Security (RLS) enforcement on all 13 tables.
-- SAFETY: Fully idempotent; does NOT alter, drop, or remove any table data.
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.utr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_pricings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pricing_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gst_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.itr_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Revoke Anonymous / Public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, public;

-- 3. Grant backend service access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
        GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
    END IF;
END $$;

-- 4. Create Service Role Policies idempotently
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name != 'schema_migrations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "service_role_access_%s" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "service_role_access_%s" ON public.%I FOR ALL TO PUBLIC USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;
