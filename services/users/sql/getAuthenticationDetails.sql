SELECT users.id,
    users.email,
    given_name as "givenName", 
    family_name as "familyName",
    email,
    password,
    date_email_verified as "dateEmailVerified",
    date_banned as "dateBanned",
    date_blocked as "dateBlocked",
    array_agg(roles.name) as roles
  FROM users
  INNER JOIN user_roles ON users.id = user_roles.user_id
	INNER JOIN roles ON user_roles.role_id = roles.id
  WHERE email = $1
	GROUP BY users.id
	ORDER BY users.id;
