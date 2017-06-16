-- get all invites

SELECT
    invites.id,
    invites.email,
    array(SELECT id FROM invites_roles LEFT OUTER JOIN roles ON invites_roles.role_id = roles.id WHERE invites_roles.invite_id = invites.id) as roles,
    users.email as createdByEmail
  FROM invites
  INNER JOIN
      users
    ON users.id = invites.created_by_id; 
