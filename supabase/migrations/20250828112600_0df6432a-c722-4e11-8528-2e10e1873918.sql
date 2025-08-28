-- Allow public access to view surveys (but not user-specific data)
CREATE POLICY "Public can view surveys for answering" 
ON public.surveys 
FOR SELECT 
USING (true);

-- Update the existing policy to be more specific
DROP POLICY IF EXISTS "Users can view their own surveys" ON public.surveys;

CREATE POLICY "Users can view their own surveys in dashboard" 
ON public.surveys 
FOR SELECT 
USING (auth.uid() = user_id);