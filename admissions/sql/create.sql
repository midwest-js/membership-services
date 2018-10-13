-- Create an admission

WITH last_admission AS (
  INSERT INTO admissions (regex, created_by_id) VALUES ($1, $2) RETURNING id
), last_roles AS (
  INSERT INTO admissions_roles(role_id, admission_id) (SELECT unnest($3::int[]), id FROM last_admission)
)

SELECT id FROM last_admission;
