SELECT users.id,
    users.email,
    given_name as "givenName", 
    family_name as "familyName",
    email,
    password,
    email_verified_at as "emailVerifiedAt",
    banned_at as "bannedAt",
    blocked_at as "blockedAt",
    array_agg(roles.name) as roles
  FROM users
  INNER JOIN user_roles ON users.id = user_roles.user_id
	INNER JOIN roles ON user_roles.role_id = roles.id
  WHERE email = $1
	GROUP BY users.id
	ORDER BY users.id;
