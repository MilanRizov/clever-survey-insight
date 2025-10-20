import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextResponse {
  text: string;
  responseId: string;
}

interface TopicAnalysis {
  topic: string;
  count: number;
  responses: {
    text: string;
    responseId: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyId, questionId, textResponses }: { 
      surveyId: string; 
      questionId: string; 
      textResponses: TextResponse[] 
    } = await req.json();
    
    if (!textResponses || textResponses.length === 0) {
      return new Response(JSON.stringify({ topics: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached analysis
    const { data: cachedAnalysis } = await supabase
      .from('survey_topic_analysis')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('question_id', questionId)
      .single();

    // If cached analysis exists and response count matches, return it
    if (cachedAnalysis && cachedAnalysis.response_count === textResponses.length) {
      console.log('Returning cached analysis');
      return new Response(JSON.stringify({ topics: cachedAnalysis.topics }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Combine all text responses for analysis
    const combinedText = textResponses.map(r => `Response ${r.responseId}: ${r.text}`).join('\n\n');

    // Call Lovable AI Gateway (compatible with OpenAI API)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing survey responses to identify common topics and sentiment. 

Your task is to:
1. Identify the main topics/themes that appear across the responses
2. Group responses by these topics
3. Determine sentiment (positive, neutral, negative) for each response
4. Return results in a specific JSON format

Return ONLY a valid JSON object with this structure:
{
  "topics": [
    {
      "topic": "Topic Name",
      "count": number,
      "responses": [
        {
          "text": "original response text",
          "responseId": "responseId from input",
          "sentiment": "positive|neutral|negative"
        }
      ]
    }
  ]
}

Guidelines:
- Topics should be descriptive but concise (2-4 words)
- A response can belong to multiple topics if relevant
- Sentiment should be based on the tone and content
- Include all responses, even if they form small topics
- Aim for 3-7 meaningful topics maximum`
          },
          {
            role: 'user',
            content: `Analyze these survey responses and identify topics with sentiment:\n\n${combinedText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.', topics: [] }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.', topics: [] }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    console.log('AI Analysis Response:', analysisText);

    // Parse the JSON response from AI
    let topics: TopicAnalysis[] = [];
    try {
      const parsed = JSON.parse(analysisText);
      topics = parsed.topics || [];
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI Response was:', analysisText);
      
      // Fallback: create a simple analysis if JSON parsing fails
      topics = [{
        topic: 'General Feedback',
        count: textResponses.length,
        responses: textResponses.map(r => ({
          text: r.text,
          responseId: r.responseId,
          sentiment: 'neutral' as const
        }))
      }];
    }

    // Store or update the analysis in the database
    await supabase
      .from('survey_topic_analysis')
      .upsert({
        survey_id: surveyId,
        question_id: questionId,
        response_count: textResponses.length,
        topics: topics,
        analyzed_at: new Date().toISOString()
      }, {
        onConflict: 'survey_id,question_id'
      });

    console.log('Analysis cached successfully');

    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-open-text function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      topics: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});