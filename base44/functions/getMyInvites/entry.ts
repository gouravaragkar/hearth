import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RLS already permits invitees to read their own invites — no service role needed
    const invites = await base44.entities.HomeInvite.filter({ status: 'pending' });

    return Response.json({ invites });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});