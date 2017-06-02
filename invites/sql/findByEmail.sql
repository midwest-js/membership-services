SELECT
    id,
    email,
    token,
    consumed_at AS "consumedAt",
    array(
      SELECT id FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id
    ) as roles
  FROM invites WHERE email = $1 LIMIT 1;
