-- ================================================
-- YAPPY COMMERCE INTEGRATION - DATABASE SETUP
-- Configure permissions for Supabase tables
-- ================================================

-- 1. Grant basic permissions to authenticated and anon users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 2. Grant permissions on specific tables
GRANT ALL PRIVILEGES ON TABLE public.payments TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.yappy_sessions TO anon, authenticated;

-- 3. Grant sequence permissions for auto-generated IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- 5. Create Row Level Security (RLS) policies
-- Disable RLS for now to allow all operations (can be restricted later)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yappy_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous and authenticated users
CREATE POLICY "Allow all operations on payments" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on yappy_sessions" ON public.yappy_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Grant permissions to service_role (for server-side operations)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check table permissions
SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers 
FROM pg_tables WHERE schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';

-- ================================================
-- INSTRUCTIONS
-- ================================================

/*
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste this entire SQL script
5. Run the script
6. Verify the permissions were set correctly

This will allow the Yappy Commerce Integration to:
- Insert payment records
- Create and manage Yappy sessions
- Perform all CRUD operations needed for the integration

Note: This configuration allows full access. In production,
you may want to implement more restrictive RLS policies.
*/