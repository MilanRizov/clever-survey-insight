-- Drop the overly permissive policy that allows anyone to modify topic analysis data
DROP POLICY IF EXISTS "System can manage topic analysis" ON public.survey_topic_analysis;

-- Edge functions using service role key bypass RLS, so no replacement policy needed
-- Regular users cannot insert/update/delete, only the edge function can