-- Create an invite

WITH last_invite AS (
  INSERT INTO invites (email, token, created_by_id) VALUES ($1, $2, $3) RETURNING id
), last_roles AS (
  INSERT INTO invites_roles(role_id, invite_id) (SELECT unnest($4::int[]), id FROM last_invite)
)

SELECT id FROM last_invite;
