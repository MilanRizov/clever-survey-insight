-- Add RLS policies for system admins to access all surveys and responses
CREATE POLICY "System admins can view all surveys"
ON public.surveys FOR SELECT
USING (has_role(auth.uid(), 'system_admin'));

CREATE POLICY "System admins can view all responses"
ON public.survey_responses FOR SELECT
USING (has_role(auth.uid(), 'system_admin'));