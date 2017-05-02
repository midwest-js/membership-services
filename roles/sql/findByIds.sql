-- get all roles with ids in passed array

SELECT id, name FROM roles WHERE id = ANY($1::int[]);
