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

    // Approved invites for this user — match by email OR by invitee_id
    const approvedInvites = allInvites.filter(
      inv =>
        inv.status === 'approved' &&
        (
          inv.invitee_id === user.id ||
          inv.invitee_email?.toLowerCase() === user.email?.toLowerCase()
        )
    );

    const sharedHomeIds = [...new Set(approvedInvites.map(inv => inv.home_id))];

    if (sharedHomeIds.length === 0) {
      return Response.json({ sharedHomes: [] });
    }

    // Fetch all homes via service role, then filter to the ones we want
    const allHomes = await base44.asServiceRole.entities.Home.list('-created_date', 500);
    const sharedHomes = allHomes
      .filter(h => sharedHomeIds.includes(h.id))
      .map(h => ({ ...h, _shared: true }));

    return Response.json({ sharedHomes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});