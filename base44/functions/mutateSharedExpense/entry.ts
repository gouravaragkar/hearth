import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { home_id, entity, action, data, id } = await req.json();

    if (!home_id || !entity || !action) {
      return Response.json({ error: 'home_id, entity and action required' }, { status: 400 });
    }
    if (!['Expense', 'RecurringExpense', 'Budget'].includes(entity)) {
      return Response.json({ error: 'Invalid entity' }, { status: 400 });
    }
    if (!['create', 'update', 'delete'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check access: either owner OR approved invitee
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

    const repo = base44.asServiceRole.entities[entity];
    let result;

    if (action === 'create') {
      result = await repo.create({ ...data, home_id });
    } else if (action === 'update') {
      if (!id) return Response.json({ error: 'id required for update' }, { status: 400 });
      result = await repo.update(id, data);
    } else if (action === 'delete') {
      if (!id) return Response.json({ error: 'id required for delete' }, { status: 400 });
      result = await repo.delete(id);
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});