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

    // RLS already permits invitees to read and update their own invites — no service role needed
    const invite = await base44.entities.HomeInvite.get(inviteId);

    if (!invite) {
      return Response.json({ error: 'Invite not found or already cancelled.' }, { status: 404 });
    }

    if (invite.invitee_email?.toLowerCase() !== user.email?.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (invite.status !== 'pending') {
      return Response.json({ error: 'This invitation is no longer available — the inviter may have cancelled it.' }, { status: 409 });
    }

    const updateData = { status: action };
    if (action === 'approved') {
      updateData.invitee_id = user.id;
    }
    await base44.entities.HomeInvite.update(inviteId, updateData);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});