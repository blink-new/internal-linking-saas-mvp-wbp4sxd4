import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UpdateJobPayload {
  job_id: string;
  anchors_added?: number;
  anchors_log?: any;
  status?: 'done' | 'error';
  error_message?: string;
  original_html?: string;
  updated_html?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: UpdateJobPayload = await req.json();
    const { job_id, anchors_added, anchors_log, status, error_message, original_html, updated_html } = payload;

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the job to get user context
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, projects!inner(user_id)')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = job.projects.user_id;
    let original_doc_url = null;
    let updated_doc_url = null;

    // Upload HTML files to storage if provided
    if (original_html || updated_html) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (original_html) {
        const originalFileName = `${userId}/${job_id}/original-${timestamp}.html`;
        const { data: originalUpload, error: originalError } = await supabase.storage
          .from('doc-snapshots')
          .upload(originalFileName, original_html, {
            contentType: 'text/html',
            upsert: false
          });

        if (!originalError && originalUpload) {
          const { data: originalUrl } = supabase.storage
            .from('doc-snapshots')
            .getPublicUrl(originalFileName);
          original_doc_url = originalUrl.publicUrl;
        }
      }

      if (updated_html) {
        const updatedFileName = `${userId}/${job_id}/updated-${timestamp}.html`;
        const { data: updatedUpload, error: updatedError } = await supabase.storage
          .from('doc-snapshots')
          .upload(updatedFileName, updated_html, {
            contentType: 'text/html',
            upsert: false
          });

        if (!updatedError && updatedUpload) {
          const { data: updatedUrl } = supabase.storage
            .from('doc-snapshots')
            .getPublicUrl(updatedFileName);
          updated_doc_url = updatedUrl.publicUrl;
        }
      }
    }

    // Update the job with new data
    const updateData: any = {
      status: status || 'done',
      updated_at: new Date().toISOString(),
    };

    if (anchors_added !== undefined) updateData.anchors_added = anchors_added;
    if (anchors_log !== undefined) updateData.anchors_log = anchors_log;
    if (error_message) updateData.error_message = error_message;
    if (original_doc_url) updateData.original_doc_url = original_doc_url;
    if (updated_doc_url) updateData.updated_doc_url = updated_doc_url;

    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', job_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating job:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update job', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        job: updatedJob,
        files_uploaded: {
          original_doc_url,
          updated_doc_url
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-job function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});