-- get all users

SELECT users.id,
    users.email,
    given_name as "givenName", 
    family_name as "familyName",
    email,
    email_verified_at as "emailVerifiedAt";
    array_agg(roles.name) as roles,
  FROM users
  INNER JOIN user_roles ON users.id = user_roles.user_id
	INNER JOIN roles ON user_roles.role_id = roles.id
	GROUP BY users.id
	ORDER BY users.id;
