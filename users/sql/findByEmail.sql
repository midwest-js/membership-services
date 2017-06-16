SELECT users.id,
    users.email,
    given_name as "givenName", 
    family_name as "familyName",
    email,
    email_verified_at as "emailVerifiedAt";
    array_agg(roles.name) as roles,
  FROM users
  INNER JOIN users_roles ON users.id = users_roles.user_id
	INNER JOIN roles ON users_roles.role_id = roles.id
  WHERE users.email = $1
  GROUP BY users.email;
