-- get all admissions

SELECT
    admissions.id,
    admissions.regex,
    array(SELECT id FROM admissions_roles LEFT OUTER JOIN roles ON admissions_roles.role_id = roles.id WHERE admissions_roles.admission_id = admissions.id) as roles,
    users.email as createdByEmail
  FROM admissions
  INNER JOIN
      users
    ON users.id = admissions.created_by_id; 
