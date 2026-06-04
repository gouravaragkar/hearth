import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { guest_user_id } = await req.json();

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get new user ID from the JWT token
    const { data: { user: newUser } } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    if (!newUser) throw new Error('Not authenticated');

    const newUserId = newUser.id;

    // Migrate homes
    await supabase.from('homes')
      .update({ created_by: newUserId })
      .eq('created_by', guest_user_id);

    // Migrate expenses
    await supabase.from('expenses')
      .update({ created_by: newUserId })
      .eq('created_by', guest_user_id);

    // Migrate recurring expenses
    await supabase.from('recurring_expenses')
      .update({ created_by: newUserId })
      .eq('created_by', guest_user_id);

    // Migrate budgets
    await supabase.from('budgets')
      .update({ created_by: newUserId })
      .eq('created_by', guest_user_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
