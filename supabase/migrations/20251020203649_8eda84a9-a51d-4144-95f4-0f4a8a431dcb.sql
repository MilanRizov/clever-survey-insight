-- Create table to store topic analysis results
CREATE TABLE IF NOT EXISTS public.survey_topic_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  response_count INTEGER NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, question_id)
);

-- Enable RLS
ALTER TABLE public.survey_topic_analysis ENABLE ROW LEVEL SECURITY;

-- Survey owners can view analysis for their surveys
CREATE POLICY "Survey owners can view topic analysis"
ON public.survey_topic_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_topic_analysis.survey_id
    AND surveys.user_id = auth.uid()
  )
);

-- System can insert/update analysis
CREATE POLICY "System can manage topic analysis"
ON public.survey_topic_analysis
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_survey_topic_analysis_survey_question 
ON public.survey_topic_analysis(survey_id, question_id);

-- Add trigger for updated_at
CREATE TRIGGER update_survey_topic_analysis_updated_at
BEFORE UPDATE ON public.survey_topic_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();