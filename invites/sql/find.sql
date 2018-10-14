SELECT
  invites.id,
  invites.email,
  invites.consumed_at AS "consumedAt",
  invites.created_at AS "createdAt",
  array(
    SELECT json_build_object('id', roles.id, 'name', roles.name)
      FROM invites_roles
      LEFT OUTER JOIN roles
        ON invites_roles.role_id = roles.id
      WHERE invites_roles.invite_id = invites.id
  ) as roles,
  users.email as "createdByEmail"
  FROM invites
  LEFT OUTER JOIN users
    ON users.id = invites.created_by_id 
  LIMIT 20
  OFFSET $1;
