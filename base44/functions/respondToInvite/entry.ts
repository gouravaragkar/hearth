import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteId, action } = await req.json();
    if (!inviteId || !['approved', 'declined'].includes(action)) {
      return Response.json({ error: 'Invalid params' }, { status: 400 });
    }

    // Fetch the invite via service role
    const allInvites = await base44.asServiceRole.entities.HomeInvite.list('-created_date', 500);
    const invite = allInvites.find(inv => inv.id === inviteId);

    if (!invite) {
      return Response.json({ error: 'Invite not found or already cancelled.' }, { status: 404 });
    }

    if (invite.invitee_email?.toLowerCase() !== user.email?.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (invite.status !== 'pending') {
      return Response.json({ error: 'This invitation is no longer available — the inviter may have cancelled it.' }, { status: 409 });
    }

    await base44.asServiceRole.entities.HomeInvite.update(inviteId, { status: action });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});