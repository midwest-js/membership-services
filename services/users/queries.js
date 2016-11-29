'use strict';

module.exports = {
  create: `
    WITH last_user AS (
      INSERT INTO users (given_name, family_name, email, password, date_email_verified)
        VALUES ($1, $2, $3, $4, NOW()) RETURNING id
    ), last_roles AS (
      INSERT INTO user_roles(role_id, user_id) (SELECT unnest($5::int[]), id FROM last_user)
    )

    SELECT id FROM last_user;
  `,
  getAll: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, user_roles, roles
      WHERE users.id = user_roles.user_id
      AND user_roles.role_id = roles.id
      GROUP BY users.email;
    `,
  findById: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, user_roles, roles
      WHERE users.id = user_roles.user_id
      AND user_roles.role_id = roles.id
      AND users.id = $1
      GROUP BY users.email;
    `,
  findByEmail: `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, user_roles, roles
      WHERE users.id = user_roles.user_id
      AND user_roles.role_id = roles.id
      AND users.email = $1
      GROUP BY users.email;
    `,
  getAuthenticationDetails: `
    SELECT id, email, password, date_email_verified, date_banned, date_blocked,
        array(SELECT name FROM user_roles LEFT OUTER JOIN roles ON user_roles.role_id = roles.id WHERE user_roles.user_id = users.id) as roles
      FROM users 
      WHERE email = $1;
    `,
  login: `
    UPDATE users SET last_login = NOW()
      WHERE email = $1;
    `,
};
