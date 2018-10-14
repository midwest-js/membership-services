SELECT
    id,
    email,
    token,
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM invites_roles
        LEFT OUTER JOIN roles
          ON invites_roles.role_id = roles.id
        WHERE invites_roles.invite_id = invites.id
    ) as roles,
    created_at AS "createdAt",
    (
      SELECT json_build_object('id', users.id, 'username', users.username, 'email', users.email)
        FROM users
        WHERE users.id = invites.created_by_id
    ) as "createdBy",
    consumed_at AS "consumedAt"
  FROM invites
  WHERE id = $1;
