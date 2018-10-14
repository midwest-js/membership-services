SELECT
    id,
    regex,
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM admissions_roles
        LEFT OUTER JOIN roles
          ON admissions_roles.role_id = roles.id
        WHERE admissions_roles.admission_id = admissions.id
    ) as roles,
    created_at AS "createdAt",
    (
      SELECT json_build_object('id', users.id, 'username', users.username, 'email', users.email)
        FROM users
        WHERE users.id = admissions.created_by_id
    ) as "createdBy"
  FROM admissions
  WHERE id = $1 LIMIT 1;
