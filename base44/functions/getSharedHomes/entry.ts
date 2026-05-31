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

    // Approved invites for this user — match by invitee_id OR email
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

    // Fetch each home individually using service role — more reliable than list + filter
    const homeResults = await Promise.all(
      sharedHomeIds.map(async (homeId) => {
        try {
          // Try direct get first
          const homes = await base44.asServiceRole.entities.Home.filter({ id: homeId });
          return homes[0] || null;
        } catch {
          return null;
        }
      })
    );

    const sharedHomes = homeResults.filter(Boolean).map(h => ({ ...h, _shared: true }));

    return Response.json({ sharedHomes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});