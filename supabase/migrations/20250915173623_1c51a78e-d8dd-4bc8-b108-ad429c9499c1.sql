-- Fix security vulnerability: Restrict profile viewing to system admins only
-- Remove public access to all profiles and restrict to system admins

DROP POLICY IF EXISTS "Allow viewing all profiles for admin purposes" ON public.profiles;

-- Create new policy that only allows system admins to view all profiles
CREATE POLICY "System admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'system_admin'::app_role));

-- Verify other policies remain intact for user's own profile access
-- (Users can still view their own profile via the existing policy)