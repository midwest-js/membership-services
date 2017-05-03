-- Create a user

INSERT INTO users (given_name, family_name, email, password, email_verified_at)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING
    id,
    given_name as "givenName", 
    family_name as "familyName",
    email,
    email_verified_at as "emailVerifiedAt";
