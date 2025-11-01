import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    // Get user from token
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating survey questions for prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a survey design expert. Generate 3-5 relevant, well-structured survey questions based on the user\'s topic or goal. Questions should be clear, unbiased, and appropriate for the context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_survey_questions',
              description: 'Generate 3-5 survey questions based on the topic',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'A descriptive title for the survey'
                  },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['single-choice', 'multiple-choice', 'open-text', 'rating', 'date'],
                          description: 'The type of question'
                        },
                        title: {
                          type: 'string',
                          description: 'The question text'
                        },
                        description: {
                          type: 'string',
                          description: 'Optional description or help text for the question'
                        },
                        options: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Answer options for single-choice or multiple-choice questions'
                        },
                        required: {
                          type: 'boolean',
                          description: 'Whether the question is required'
                        }
                      },
                      required: ['type', 'title', 'required']
                    },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ['title', 'questions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_survey_questions' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate survey questions');
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_survey_questions') {
      throw new Error('Unexpected AI response format');
    }

    const surveyData = JSON.parse(toolCall.function.arguments);
    console.log('Generated survey:', surveyData);

    // Log AI usage
    const usage = data.usage || {};
    const estimatedCost = ((usage.prompt_tokens || 0) * 0.000001 + (usage.completion_tokens || 0) * 0.000002);
    
    await supabase.from('ai_usage_history').insert({
      user_id: user.id,
      operation_type: 'generate_survey_questions',
      model: 'google/gemini-2.5-flash',
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      estimated_cost: estimatedCost,
      metadata: { prompt_length: prompt.length, questions_generated: surveyData.questions?.length || 0 }
    });

    return new Response(
      JSON.stringify(surveyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-survey-questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
