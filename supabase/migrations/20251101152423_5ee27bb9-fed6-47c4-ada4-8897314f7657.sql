-- Create AI usage history table
CREATE TABLE public.ai_usage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  operation_type text NOT NULL,
  model text NOT NULL,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  estimated_cost numeric(10, 6),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view their own AI usage history"
ON public.ai_usage_history
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert records (via service role in edge functions)
CREATE POLICY "Service role can insert AI usage history"
ON public.ai_usage_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_ai_usage_history_user_id ON public.ai_usage_history(user_id);
CREATE INDEX idx_ai_usage_history_created_at ON public.ai_usage_history(created_at DESC);