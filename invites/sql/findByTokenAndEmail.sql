SELECT id, email, token, date_consumed AS "dateConsumed" FROM invites WHERE token = $1 AND email = $2 LIMIT 1;
