'use strict';

module.exports = {
  create: `
    WITH last_invite AS (
      INSERT INTO invites (email, token, created_by_id) VALUES ($1, $2, $3) RETURNING id
    ), last_roles AS (
      INSERT INTO invite_roles(role_id, invite_id) (SELECT unnest($4::int[]), id FROM last_invite)
    )

    SELECT id FROM last_invite;
  `,

  find: `
    SELECT
        invites.id,
        invites.email,
        date_consumed AS "dateConsumed",
        invites.date_created AS "dateCreated",
        array(SELECT name FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id) as roles,
        users.email as "createdByEmail"
      FROM invites
      INNER JOIN users ON users.id = invites.created_by_id 
      LIMIT 20
      OFFSET $1;
    `,

  findByTokenAndEmail: `
    SELECT id, email, token, date_consumed AS "dateConsumed" FROM invites WHERE token = $1 AND email = $2 LIMIT 1;
  `,

  findByEmail: `
    SELECT id, email, token, date_consumed AS "dateConsumed",
      array(SELECT id FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id) as roles
    FROM invites WHERE email = $1 LIMIT 1;
  `,

  findById: `
    SELECT id, email, token, date_consumed AS "dateConsumed",
      array(SELECT json_build_object('id', roles.id, 'name', roles.name) FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id) as roles
    FROM invites WHERE id = $1 LIMIT 1;
    `,

  getAll: `
    SELECT
        invites.id,
        invites.email,
        array(SELECT id FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id) as roles,
        users.email as createdByEmail
      FROM invites
      INNER JOIN users ON users.id = invites.created_by_id; 
    `,
};
