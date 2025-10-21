-- Create a public view that only exposes necessary survey fields (no user_id)
CREATE OR REPLACE VIEW public.public_surveys AS
SELECT 
  id,
  title,
  questions,
  created_at,
  updated_at
FROM public.surveys;

-- Grant SELECT access to the view for everyone
GRANT SELECT ON public.public_surveys TO anon, authenticated;

-- Drop the overly permissive public SELECT policy on surveys table
DROP POLICY IF EXISTS "Public can view surveys for answering" ON public.surveys;

-- The existing "Users can view their own surveys in dashboard" policy remains
-- for authenticated users to see their own surveys with full details