import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Service role bypasses RLS so invitee can see invites they didn't create
    const allInvites = await base44.asServiceRole.entities.HomeInvite.list('-created_date', 500);

    // Pending invites where current user is the invitee
    const pendingForMe = allInvites.filter(
      inv =>
        inv.invitee_email?.toLowerCase() === user.email?.toLowerCase() &&
        inv.status === 'pending'
    );

    return Response.json({ invites: pendingForMe });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});