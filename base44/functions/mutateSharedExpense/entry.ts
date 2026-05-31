import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { home_id, entity, action, data, id } = await req.json();
    // entity: 'Expense' | 'RecurringExpense'
    // action: 'create' | 'update' | 'delete'

    if (!home_id || !entity || !action) {
      return Response.json({ error: 'home_id, entity and action required' }, { status: 400 });
    }
    if (!['Expense', 'RecurringExpense'].includes(entity)) {
      return Response.json({ error: 'Invalid entity' }, { status: 400 });
    }
    if (!['create', 'update', 'delete'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify the user has an approved invite for this home
    const allInvites = await base44.asServiceRole.entities.HomeInvite.list('-created_date', 500);
    const hasAccess = allInvites.some(
      inv =>
        inv.home_id === home_id &&
        inv.status === 'approved' &&
        (inv.invitee_id === user.id || inv.invitee_email?.toLowerCase() === user.email?.toLowerCase())
    );

    if (!hasAccess) return Response.json({ error: 'Forbidden' }, { status: 403 });

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