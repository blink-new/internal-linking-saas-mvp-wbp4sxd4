import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Processing Stripe event:', event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          console.log('No subscription ID found in invoice');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;
        
        // Get customer details to find user
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          console.error('Customer not found or deleted');
          break;
        }

        const userEmail = (customer as Stripe.Customer).email;
        if (!userEmail) {
          console.error('No email found for customer');
          break;
        }

        // Find user by email
        const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
        if (userError || !user) {
          console.error('User not found:', userError);
          break;
        }

        // Get plan details from subscription
        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) {
          console.error('No price ID found in subscription');
          break;
        }

        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single();

        if (planError || !plan) {
          console.error('Plan not found for price ID:', priceId, planError);
          break;
        }

        // Calculate billing period
        const periodStart = new Date(subscription.current_period_start * 1000);
        const periodEnd = new Date(subscription.current_period_end * 1000);

        // Create or update usage record
        const { error: usageError } = await supabase
          .from('usage')
          .upsert({
            user_id: user.user.id,
            plan_id: plan.id,
            jobs_used: 0, // Reset on new billing period
            jobs_limit: plan.monthly_jobs_limit,
            billing_period_start: periodStart.toISOString(),
            billing_period_end: periodEnd.toISOString(),
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,billing_period_start',
            ignoreDuplicates: false
          });

        if (usageError) {
          console.error('Error updating usage:', usageError);
        } else {
          console.log(`Updated usage for user ${user.user.id} with plan ${plan.name}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          console.error('Customer not found or deleted');
          break;
        }

        const userEmail = (customer as Stripe.Customer).email;
        if (!userEmail) {
          console.error('No email found for customer');
          break;
        }

        // Find user by email
        const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
        if (userError || !user) {
          console.error('User not found:', userError);
          break;
        }

        // Reset to free plan
        const { data: freePlan } = await supabase
          .from('plans')
          .select('*')
          .eq('stripe_price_id', 'free')
          .single();

        if (freePlan) {
          const now = new Date();
          const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          await supabase
            .from('usage')
            .upsert({
              user_id: user.user.id,
              plan_id: freePlan.id,
              jobs_used: 0,
              jobs_limit: freePlan.monthly_jobs_limit,
              billing_period_start: periodStart.toISOString(),
              billing_period_end: periodEnd.toISOString(),
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,billing_period_start',
              ignoreDuplicates: false
            });

          console.log(`Reset user ${user.user.id} to free plan`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});