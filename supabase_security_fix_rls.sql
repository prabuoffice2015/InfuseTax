-- ==============================================================================
-- InfuseTax Enterprise Supabase Security Hardening & RLS Enforcement Script
-- Fixes Supabase Security Advisor "RLS Disabled in Public" (13 Errors)
-- ==============================================================================

-- 1. Enable Row-Level Security (RLS) on all 13 public tables
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

-- 2. Revoke all direct Anonymous / Public PostgREST API access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, public;

-- 3. Grant full secure access to service_role and postgres backend database user
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- 4. Create explicit Service Role Policies for each table
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "service_role_access_%s" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "service_role_access_%s" ON public.%I FOR ALL TO service_role, postgres USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;
