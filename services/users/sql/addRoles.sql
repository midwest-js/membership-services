INSERT INTO user_roles (user_id, role_id)
  SELECT $1, role_ids FROM unnest($2::int[]) as role_ids
  RETURNING user_id, role_id;

/* INSERT INTO user_roles (user_id, role_id) */
/*   SELECT $1, role_ids FROM unnest($2::int[]); */

/* SELECT * FROM roles WHERE id = ANY($2::int[]); */
