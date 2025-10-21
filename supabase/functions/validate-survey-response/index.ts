import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define validation schemas
const singleChoiceSchema = z.string().max(500);
const multipleChoiceSchema = z.array(z.string().max(500)).max(50);
const openTextSchema = z.string().max(5000);

const responseDataSchema = z.record(
  z.string(),
  z.union([singleChoiceSchema, multipleChoiceSchema, openTextSchema])
);

const requestSchema = z.object({
  survey_id: z.string().uuid(),
  response_data: responseDataSchema,
  user_agent: z.string().max(500).optional(),
});

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 submissions per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New record or expired window - reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return true;
}

// Sanitize text to prevent XSS
function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Recursively sanitize response data
function sanitizeResponseData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    console.log('Validating survey response from IP:', ip);

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.log('Rate limit exceeded for IP:', ip);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = requestSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input data',
            details: validationError.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            })),
            code: 'VALIDATION_ERROR'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw validationError;
    }

    // Sanitize all text inputs
    const sanitizedData = sanitizeResponseData(validatedData.response_data);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify survey exists and is published
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, is_published')
      .eq('id', validatedData.survey_id)
      .eq('is_published', true)
      .single();

    if (surveyError || !survey) {
      console.error('Survey not found or not published:', surveyError);
      return new Response(
        JSON.stringify({ 
          error: 'Survey not found or not available',
          code: 'SURVEY_NOT_FOUND' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Survey validated, inserting response...');

    // Insert the validated and sanitized response
    const { data: response, error: insertError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: validatedData.survey_id,
        response_data: sanitizedData,
        user_agent: validatedData.user_agent || null,
        ip_address: null, // Don't store IP for privacy
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting response:', insertError);
      throw insertError;
    }

    console.log('Response inserted successfully:', response.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Response submitted successfully',
        response_id: response.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
