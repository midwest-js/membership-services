SELECT
  admissions.id,
  admissions.regex,
  admissions.created_at AS "createdAt",
  array(
    SELECT json_build_object('id', roles.id, 'name', roles.name)
      FROM admissions_roles
      LEFT OUTER JOIN roles
        ON admissions_roles.role_id = roles.id
      WHERE admissions_roles.admission_id = admissions.id
  ) as roles,
  users.username as "createdByUsername"
FROM admissions
LEFT OUTER JOIN users ON users.id = admissions.created_by_id 
LIMIT 20
OFFSET $1;
