import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'email is required' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const users = await base44.asServiceRole.entities.User.filter({ email: normalised });
    const match = users?.[0];

    if (!match) {
      return Response.json({ user: null });
    }

    // Return only what the caller needs — never expose full user records
    return Response.json({ user: { id: match.id, full_name: match.full_name } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});