import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendWebPush(subscription: any, payload: object, vapidKeys: { publicKey: string, privateKey: string }) {
  const webpush = await import('https://esm.sh/web-push@3.6.7');
  webpush.setVapidDetails(
    'mailto:invites@myhomespend.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SECRET_KEYS')
        ? JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!).service_role
        : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) throw new Error('VAPID keys not set');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ message: 'No subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let notificationsSent = 0;

    for (const sub of subscriptions) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + sub.days_before);
      const dueDateStr = dueDate.toISOString().slice(0, 10);

      const { data: homes } = await supabase
        .from('homes')
        .select('id, name')
        .or(`created_by.eq.${sub.user_id},members.cs.{${sub.user_id}}`);

      if (!homes?.length) continue;

      const homeIds = homes.map((h: any) => h.id);

      const { data: dueExpenses } = await supabase
        .from('recurring_expenses')
        .select('name, amount, currency, next_due_date, home_id')
        .in('home_id', homeIds)
        .eq('next_due_date', dueDateStr);

      if (!dueExpenses?.length) continue;

      for (const expense of dueExpenses) {
        const daysLabel = sub.days_before === 1 ? 'tomorrow' : `in ${sub.days_before} days`;
        const payload = {
          title: `${expense.name} is due ${daysLabel}`,
          body: `${expense.currency} ${expense.amount} — tap to view`,
          url: 'https://www.myhomespend.com',
          tag: `bill-${expense.name}-${dueDateStr}`,
        };

        try {
          await sendWebPush(sub.subscription, payload, {
            publicKey: VAPID_PUBLIC_KEY,
            privateKey: VAPID_PRIVATE_KEY,
          });
          notificationsSent++;
        } catch (e: any) {
          console.error('Push failed for:', sub.user_id, e.message);
          if (e.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ notificationsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
