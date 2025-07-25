import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerJobRequest {
  job_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    const edgeSecret = Deno.env.get("EDGE_SECRET")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!n8nWebhookUrl) {
      throw new Error('Missing N8N_WEBHOOK_URL environment variable');
    }

    if (!edgeSecret) {
      throw new Error("Missing EDGE_SECRET env var");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { job_id }: TriggerJobRequest = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch the job from database
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (fetchError || !job) {
      console.error('Error fetching job:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update job status to 'processing'
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update job status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send job data to N8N webhook
    const n8nPayload = {
      job_id: job.id,
      project_id: job.project_id,
      title: job.title,
      article_doc: job.article_doc,
      status: 'processing'
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-edge-secret': edgeSecret,
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      console.error('N8N webhook failed:', await n8nResponse.text());
      
      // Update job status to 'error' if N8N webhook fails
      await supabase
        .from('jobs')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', job_id);

      return new Response(
        JSON.stringify({ error: 'Failed to trigger N8N workflow' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Job ${job_id} triggered successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id,
        status: 'processing',
        message: 'Job triggered successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in trigger-job function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});