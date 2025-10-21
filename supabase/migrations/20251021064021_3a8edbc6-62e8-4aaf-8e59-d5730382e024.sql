-- Ensure RLS is enabled on profiles table (should already be enabled, but confirming)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Revoke any public grants that might exist
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Ensure only authenticated users can access profiles through existing policies
-- The existing policies already restrict access appropriately:
-- 1. Users can view their own profile
-- 2. System admins can view all profiles
-- This migration just ensures no public grants bypass RLS