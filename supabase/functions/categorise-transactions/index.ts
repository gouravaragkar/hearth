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

    const { rawText, currency } = await req.json();
    if (!rawText) throw new Error('No statement text provided');

    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a bank statement parser. Extract all debit transactions (money spent/outgoing) from this bank statement text.

Today's date: ${today}
Currency: ${currency || 'AUD'}

IMPORTANT RULES:
- Only extract DEBITS (money going out). Skip credits, deposits, refunds, and interest.
- Skip internal transfers between accounts.
- Dates must be in YYYY-MM-DD format. If year is missing, assume the most recent past year.
- Amounts must be positive numbers (no currency symbols, no commas).
- Clean up merchant names: remove transaction IDs, card numbers, location codes. Keep it readable (e.g. "WOOLWORTHS 1234 SYDNEY" → "Woolworths").
- Category must be one of: Housing, Transport, Groceries, Utilities, Healthcare, Entertainment, Dining, Shopping, Education, Other

Return ONLY a valid JSON array, no other text:
[
  {
    "date": "YYYY-MM-DD",
    "name": "Merchant Name",
    "amount": 123.45,
    "category": "Category"
  }
]

Bank statement text:
${rawText.slice(0, 12000)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');

    const text = data.content[0].text.trim();

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No transaction data found in statement');

    const transactions = JSON.parse(jsonMatch[0]);

    // Validate and sanitise each transaction
    const valid = transactions
      .filter((t: { date?: string; name?: string; amount?: number }) =>
        t.date && t.name && typeof t.amount === 'number' && t.amount > 0
      )
      .map((t: { date: string; name: string; amount: number; category?: string }) => ({
        date: t.date,
        name: String(t.name).slice(0, 100),
        amount: Math.round(t.amount * 100) / 100,
        category: t.category || 'Other',
      }));

    return new Response(JSON.stringify({ transactions: valid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
