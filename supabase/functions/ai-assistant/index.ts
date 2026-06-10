import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { messages, homeContext } = await req.json();

    const systemPrompt = `You are a helpful home finance assistant for HomeSpend app.

Today's date is: ${new Date().toISOString().slice(0, 10)}

Current home context:
- Home: ${homeContext.homeName} (${homeContext.currency})
- This month's spending: ${homeContext.currency} ${homeContext.totalSpent}
- Monthly budget: ${homeContext.currency} ${homeContext.budget || 'not set'}
- Active recurring expenses: ${homeContext.recurringCount}

You can help users:
1. LOG EXPENSES: When user wants to add an expense, extract: name, amount, category, date (default today), type (one-time or recurring)
   - Categories: Housing, Transport, Groceries, Utilities, Healthcare, Entertainment, Dining, Shopping, Education, Other
   - For recurring: also extract frequency (weekly/fortnightly/monthly/quarterly/semi-annual/annual)
   - Respond with JSON action: {"action": "create_expense", "data": {...}} OR {"action": "create_recurring", "data": {...}}

2. ANSWER QUESTIONS: About spending, budgets, trends — answer conversationally using the context provided.

3. GENERAL CHAT: Be helpful, friendly and concise.

When logging an expense, ALWAYS confirm what you're creating before responding with the JSON.
Format: First explain what you understood, then on a new line output the JSON.
Example: "I'll add a $120 electricity bill for today.\n{"action":"create_expense","data":{"name":"Electricity","amount":120,"category":"Utilities","date":"2026-06-10"}}"

Keep responses concise — this is a mobile chat interface.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');

    return new Response(JSON.stringify({ content: data.content[0].text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
