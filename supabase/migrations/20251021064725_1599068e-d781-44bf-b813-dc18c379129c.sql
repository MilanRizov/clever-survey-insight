-- Fix 1: Add is_published column to surveys table for publication control
ALTER TABLE public.surveys 
ADD COLUMN is_published boolean NOT NULL DEFAULT false;

-- Recreate the public_surveys view to only show published surveys
DROP VIEW IF EXISTS public.public_surveys;

CREATE VIEW public.public_surveys AS
SELECT id, title, questions, created_at, updated_at
FROM public.surveys
WHERE is_published = true;

-- Enable RLS on the view (views inherit RLS from base table, but we ensure it's explicit)
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access ONLY to published surveys
CREATE POLICY "Public can view published surveys"
ON public.surveys
FOR SELECT
USING (is_published = true);

-- This allows unauthenticated users to view published surveys
-- while authenticated users can still view their own surveys via existing policy