SELECT
    id,
    email,
    token,
    created_at AS "createdAt",
    consumed_at AS "consumedAt",
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM invites_roles
        LEFT OUTER JOIN roles
          ON invites_roles.role_id = roles.id
        WHERE invites_roles.invite_id = invites.id
    ) as roles
  FROM invites WHERE email = $1 LIMIT 1;
