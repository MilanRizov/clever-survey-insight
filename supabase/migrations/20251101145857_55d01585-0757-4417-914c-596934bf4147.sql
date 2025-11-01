-- Fix public_surveys view security issue
-- Drop the existing view
DROP VIEW IF EXISTS public.public_surveys;

-- Recreate the view with SECURITY DEFINER to allow public access to published surveys
-- This view intentionally bypasses RLS to allow unauthenticated users to view published surveys
-- Security is enforced by only showing published surveys and excluding sensitive user_id data
CREATE VIEW public.public_surveys
WITH (security_invoker = false) -- This makes it SECURITY DEFINER
AS
SELECT 
  id,
  title,
  questions,
  created_at,
  updated_at
FROM public.surveys
WHERE is_published = true;

-- Grant SELECT access to anonymous and authenticated users
GRANT SELECT ON public.public_surveys TO anon, authenticated;