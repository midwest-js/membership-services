UPDATE users SET last_login = NOW()
  WHERE email = $1;
