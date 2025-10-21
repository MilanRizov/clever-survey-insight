-- Fix the security definer view by explicitly setting it to SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the creator
DROP VIEW IF EXISTS public.public_surveys;

CREATE VIEW public.public_surveys 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  questions,
  created_at,
  updated_at
FROM public.surveys;

-- Grant SELECT access to the view for everyone
GRANT SELECT ON public.public_surveys TO anon, authenticated;