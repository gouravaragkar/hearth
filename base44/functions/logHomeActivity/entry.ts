import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { home_id, entity, action, record_name, details } = await req.json();
    if (!home_id || !entity || !action) {
      return Response.json({ error: 'home_id, entity, action required' }, { status: 400 });
    }

    // Verify access
    const [ownedHomes, allInvites] = await Promise.all([
      base44.entities.Home.list('-created_date', 100),
      base44.asServiceRole.entities.HomeInvite.filter({ home_id }, '-created_date', 100),
    ]);

    const isOwner = ownedHomes.some(h => h.id === home_id);
    const hasInvite = allInvites.some(
      inv =>
        inv.status === 'approved' &&
        (inv.invitee_id === user.id || inv.invitee_email?.toLowerCase() === user.email?.toLowerCase())
    );

    if (!isOwner && !hasInvite) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await base44.asServiceRole.entities.HomeActivity.create({
      home_id,
      entity,
      action,
      actor_id: user.id,
      actor_name: user.full_name || user.email || 'Unknown',
      record_name: record_name || '',
      details: details || '',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});