import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch up to 10 queued jobs
    const { data: queuedJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching queued jobs:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch queued jobs',
          details: fetchError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!queuedJobs || queuedJobs.length === 0) {
      console.log('No queued jobs found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No queued jobs found',
          processed_count: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${queuedJobs.length} queued jobs to process`);

    // Process each queued job by calling trigger-job function
    const results = [];
    
    for (const job of queuedJobs) {
      try {
        // Call the trigger-job function
        const triggerResponse = await supabase.functions.invoke('trigger-job', {
          body: { job_id: job.id }
        });

        if (triggerResponse.error) {
          console.error(`Failed to trigger job ${job.id}:`, triggerResponse.error);
          results.push({
            job_id: job.id,
            success: false,
            error: triggerResponse.error.message
          });
        } else {
          console.log(`Successfully triggered job ${job.id}`);
          results.push({
            job_id: job.id,
            success: true,
            data: triggerResponse.data
          });
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        results.push({
          job_id: job.id,
          success: false,
          error: error.message
        });
      }

      // Add a small delay between job triggers to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Cron job completed: ${successCount} successful, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${queuedJobs.length} queued jobs`,
        processed_count: queuedJobs.length,
        success_count: successCount,
        error_count: errorCount,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cron-run-jobs function:', error);
    
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