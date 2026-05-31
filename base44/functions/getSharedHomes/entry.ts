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

    if (approvedInvites.length === 0) {
      return Response.json({ sharedHomes: [] });
    }

    // Deduplicate by home_id and build home objects from denormalised invite data
    const seen = new Set();
    const sharedHomes = [];
    for (const inv of approvedInvites) {
      if (!seen.has(inv.home_id)) {
        seen.add(inv.home_id);
        // Try to fetch the actual home via service role for full data
        try {
          const allHomes = await base44.asServiceRole.entities.Home.list('-created_date', 1000);
          const home = allHomes.find(h => h.id === inv.home_id);
          if (home) {
            sharedHomes.push({ ...home, _shared: true });
          } else {
            // Fallback: reconstruct from denormalised invite fields
            sharedHomes.push({
              id: inv.home_id,
              name: inv.home_name,
              emoji: inv.home_emoji || '🏠',
              currency: inv.home_currency || 'AUD',
              _shared: true,
            });
          }
        } catch {
          // Fallback: reconstruct from denormalised invite fields
          sharedHomes.push({
            id: inv.home_id,
            name: inv.home_name,
            emoji: inv.home_emoji || '🏠',
            currency: inv.home_currency || 'AUD',
            _shared: true,
          });
        }
      }
    }

    return Response.json({ sharedHomes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});