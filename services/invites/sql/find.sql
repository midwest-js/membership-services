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
