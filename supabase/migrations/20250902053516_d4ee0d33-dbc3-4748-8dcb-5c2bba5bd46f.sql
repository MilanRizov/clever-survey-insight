-- Create survey_responses table to store survey submissions
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy for survey owners to view responses to their surveys
CREATE POLICY "Survey owners can view responses to their surveys" 
ON public.survey_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.surveys 
    WHERE surveys.id = survey_responses.survey_id 
    AND surveys.user_id = auth.uid()
  )
);

-- Create policy for public submission of responses
CREATE POLICY "Anyone can submit survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraint
ALTER TABLE public.survey_responses 
ADD CONSTRAINT survey_responses_survey_id_fkey 
FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_submitted_at ON public.survey_responses(submitted_at);