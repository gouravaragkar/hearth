import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function advanceDate(dateStr, frequency) {
  const d = new Date(dateStr);
  switch (frequency) {
    case 'weekly':      d.setDate(d.getDate() + 7);      break;
    case 'fortnightly': d.setDate(d.getDate() + 14);     break;
    case 'quarterly':   d.setMonth(d.getMonth() + 3);    break;
    default:            d.setMonth(d.getMonth() + 1);    break; // monthly
  }
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automation (no user) or admin users only
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { /* scheduled call — no user */ }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all recurring expenses using service role
    const all = await base44.asServiceRole.entities.RecurringExpense.list();

    let updated = 0;
    for (const expense of all) {
      if (!expense.next_due_date) continue;

      const due = new Date(expense.next_due_date);
      due.setHours(0, 0, 0, 0);

      if (due <= today) {
        // Advance next_due_date past today (handles multiple missed cycles)
        let nextDue = expense.next_due_date;
        while (new Date(nextDue) <= today) {
          nextDue = advanceDate(nextDue, expense.frequency);
        }

        await base44.asServiceRole.entities.RecurringExpense.update(expense.id, {
          paid_this_cycle: false,
          next_due_date: nextDue,
        });
        updated++;
      }
    }

    return Response.json({ success: true, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});