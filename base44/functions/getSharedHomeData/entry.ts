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

    // Check if user is the owner of this home
    const home = await base44.asServiceRole.entities.Home.filter({ id: home_id }, '-created_date', 1);
    const isOwner = home.length > 0 && home[0].created_by_id === user.id;

    if (!isOwner) {
      // Check if user has an approved invite for this home
      const allInvites = await base44.asServiceRole.entities.HomeInvite.list('-created_date', 500);
      const hasAccess = allInvites.some(
        inv =>
          inv.home_id === home_id &&
          inv.status === 'approved' &&
          (inv.invitee_id === user.id || inv.invitee_email?.toLowerCase() === user.email?.toLowerCase())
      );

      if (!hasAccess) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
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