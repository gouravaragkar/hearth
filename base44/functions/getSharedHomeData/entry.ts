import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { home_id } = await req.json();
    if (!home_id) {
      return Response.json({ error: 'home_id required' }, { status: 400 });
    }

    // Check access: either owner (home created by this user) OR approved invitee
    const [ownedHomes, allInvites] = await Promise.all([
      base44.entities.Home.list('-created_date', 100), // user-scoped, returns only their homes
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

    // Fetch all data for this home using service role (bypasses RLS)
    const [expenses, recurring, budgets] = await Promise.all([
      base44.asServiceRole.entities.Expense.filter({ home_id }, '-date', 500),
      base44.asServiceRole.entities.RecurringExpense.filter({ home_id }, '-created_date', 500),
      base44.asServiceRole.entities.Budget.filter({ home_id }, '-created_date', 100),
    ]);

    return Response.json({ expenses, recurring, budgets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});