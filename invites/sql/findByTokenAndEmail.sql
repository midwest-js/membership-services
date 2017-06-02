SELECT id, email, token, consumed_at AS "consumedAt" FROM invites WHERE token = $1 AND email = $2 LIMIT 1;
