SELECT
  id,
  regex,
  created_at AS "createdAt",
  array(
    SELECT json_build_object('id', roles.id, 'name', roles.name)
      FROM admissions_roles
      LEFT OUTER JOIN roles
        ON admissions_roles.role_id = roles.id
      WHERE admissions_roles.admission_id = admissions.id
  ) as roles
  FROM admissions
  WHERE id = $1 LIMIT 1;
