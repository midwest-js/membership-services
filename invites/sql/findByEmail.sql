SELECT
    id,
    email,
    token,
    consumed_at AS "consumedAt",
    array(
      SELECT id FROM invites_roles LEFT OUTER JOIN roles ON invites_roles.role_id = roles.id WHERE invites_roles.invite_id = invites.id
    ) as roles
  FROM invites WHERE email = $1 LIMIT 1;
