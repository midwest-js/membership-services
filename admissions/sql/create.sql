-- Create an admission

WITH last_admission AS (
  INSERT INTO admissions (regex, created_by_id) VALUES ($1, $2) RETURNING *
), last_admission_roles AS (
  INSERT INTO admissions_roles(role_id, admission_id) (SELECT unnest($3::int[]), id FROM last_admission) RETURNING *
)

SELECT
    id,
    regex,
    created_at AS "createdAt",
    (SELECT json_build_object('id', users.id, 'username', users.username, 'email', users.email)
      FROM users
      WHERE users.id = last_admission.id) as "user",
    array(
      SELECT json_build_object('id', roles.id, 'name', roles.name)
        FROM last_admission_roles
        LEFT OUTER JOIN roles
          ON last_admission_roles.role_id = roles.id
        WHERE last_admission_roles.admission_id = last_admission.id
    ) as roles
  FROM last_admission;
