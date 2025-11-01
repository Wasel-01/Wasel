// Supabase Edge Function to calculate metrics periodically
// Deploy: supabase functions deploy calculate-metrics

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Calculate supply/demand metrics
    await supabase.rpc('calculate_supply_demand_metrics', {
      target_date: today,
      target_hour: currentHour
    });

    // Calculate daily growth metrics
    await supabase.rpc('calculate_daily_growth_metrics', {
      target_date: today
    });

    // Update LTV for active users (sample of 100 users per run)
    const { data: activeUsers } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_active_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (activeUsers) {
      for (const user of activeUsers) {
        await supabase.rpc('update_user_ltv', { user_id: user.id });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Metrics calculated successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
