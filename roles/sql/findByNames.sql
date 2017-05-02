-- get all roles with ids in passed array

SELECT id, name FROM roles WHERE name = ANY($1::text[]);
