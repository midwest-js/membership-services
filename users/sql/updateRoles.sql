WITH deleted_rows AS (
  DELETE FROM users_roles
    WHERE user_id = $1 AND role_id NOT IN
      (SELECT role_ids FROM unnest($2::int[]) AS role_ids)
    RETURNING role_id
), inserted_rows AS (
  INSERT INTO users_roles(user_id, role_id)
     SELECT $1, role_ids FROM unnest($2::int[]) AS role_ids WHERE NOT EXISTS
      (SELECT 1 FROM users_roles WHERE user_id = $1 AND role_id = role_ids)
    RETURNING role_id, user_id
) 

SELECT role_id, user_id FROM inserted_rows;
