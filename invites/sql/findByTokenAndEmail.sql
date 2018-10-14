SELECT
    id,
    email,
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM invites_roles
        LEFT OUTER JOIN roles
          ON invites_roles.role_id = roles.id
        WHERE invites_roles.invite_id = invites.id
    ) as roles,
    created_at AS "createdAt",
    consumed_at AS "consumedAt"
  FROM invites
  WHERE token = $1 AND email = $2;
