import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, inviter_name, home_name, home_emoji, app_url } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not set');
    }

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FFF7ED; margin: 0; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .emoji { font-size: 48px; text-align: center; margin-bottom: 16px; }
    h1 { color: #C2410C; font-size: 22px; text-align: center; margin: 0 0 12px; }
    p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .home-badge { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; padding: 12px 20px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: 600; color: #C2410C; }
    .button { display: block; background: #C2410C; color: white; text-decoration: none; text-align: center; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🏡</div>
    <h1>You've been invited to a Home!</h1>
    <p>Hi there,</p>
    <p><strong>${inviter_name}</strong> has invited you to share a home on <strong>HomeSpend</strong> — a home expense tracker for households.</p>
    <div class="home-badge">${home_emoji} ${home_name}</div>
    <p>Click the button below to log in and accept or decline the invitation from your Homes page.</p>
    <a href="${app_url}/homes?invite=true" class="button">View Invitation →</a>
    <p style="color: #6B7280; font-size: 13px;">Note: HomeSpend currently uses Google Sign-In. You'll need a Google account to accept this invitation.</p>
    <p>If you don't have an account yet, you'll need to sign up first at <a href="${app_url}">${app_url}</a></p>
    <div class="footer">HomeSpend · myhomespend.com<br>You received this because someone invited you to share a home.</div>
  </div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HomeSpend <invites@myhomespend.com>',
        to: [to],
        subject: `${inviter_name} invited you to "${home_name}" on HomeSpend`,
        html: emailBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
