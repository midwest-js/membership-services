UPDATE invites SET consumed_at = NOW() WHERE id = $1;
