-- get all invites

SELECT
    invites.id,
    invites.email,
    array(SELECT id FROM invite_roles LEFT OUTER JOIN roles ON invite_roles.role_id = roles.id WHERE invite_roles.invite_id = invites.id) as roles,
    users.email as createdByEmail
  FROM invites
  INNER JOIN
      users
    ON users.id = invites.created_by_id; 
