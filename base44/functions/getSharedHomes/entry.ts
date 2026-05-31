import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to read ALL HomeInvite records — bypasses RLS
    const allInvites = await base44.asServiceRole.entities.HomeInvite.list('-created_date', 500);

    // Approved invites for this user (as invitee)
    const approvedInvites = allInvites.filter(
      inv =>
        inv.invitee_email?.toLowerCase() === user.email?.toLowerCase() &&
        inv.status === 'approved'
    );

    const sharedHomeIds = [...new Set(approvedInvites.map(inv => inv.home_id))];

    // Fetch each shared home via service role (bypasses owner-only RLS)
    const sharedHomes = await Promise.all(
      sharedHomeIds.map(id =>
        base44.asServiceRole.entities.Home.filter({ id })
          .then(r => r[0] || null)
          .catch(() => null)
      )
    );

    const validSharedHomes = sharedHomes.filter(Boolean).map(h => ({ ...h, _shared: true }));

    return Response.json({ sharedHomes: validSharedHomes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});