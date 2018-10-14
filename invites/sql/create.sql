-- Create an invite

WITH last_invite AS (
  INSERT INTO invites (email, token, created_by_id) VALUES ($1, $2, $3) RETURNING *
), last_invite_roles AS (
  INSERT INTO invites_roles(role_id, invite_id) (SELECT unnest($4::int[]), id FROM last_invite) RETURNING *
)

SELECT
    id,
    email,
    token,
    created_at AS "createdAt",
    (SELECT json_build_object('id', users.id, 'username', users.username, 'email', users.email)
      FROM users
      WHERE users.id = last_invite.created_by_id) as "createdBy",
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM last_invite_roles
        LEFT OUTER JOIN roles
          ON last_invite_roles.role_id = roles.id
        WHERE last_invite_roles.invite_id = last_invite.id
    ) as roles
  FROM last_invite;
