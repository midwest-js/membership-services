'use strict';

module.exports = {
  create: `
    INSERT INTO users (given_name, family_name, email, password, is_email_verified)
      VALUES ('$1', '$2', '$3', '$4', $5) RETURNING id
    `,
  getAll: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, users_to_roles, roles
      WHERE users.id = users_to_roles.user
      AND users_to_roles.role = roles.id
      GROUP BY users.email;
    `,
  findById: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, users_to_roles, roles
      WHERE users.id = users_to_roles.user
      AND users_to_roles.role = roles.id
      AND users.id = $1
      GROUP BY users.email;
    `,
  findByEmail: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, users_to_roles, roles
      WHERE users.id = users_to_roles.user
      AND users_to_roles.role = roles.id
      AND users.email = $1
      GROUP BY users.email;
    `,
  getAuthenticationDetails: `
    SELECT id, email, password, date_email_verified, date_banned, date_blocked,
        array(SELECT name FROM users_to_roles LEFT OUTER JOIN roles ON users_to_roles.role = roles.id WHERE users_to_roles.user = users.id) as roles
      FROM users 
      WHERE email = $1;
    `,
  login: `
    UPDATE users SET last_login = NOW()
      WHERE email = $1;
    `,
};
