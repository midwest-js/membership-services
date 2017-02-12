'use strict';

const p = require('path');

const config = require(p.join(process.cwd(), 'server/config/membership'));

// const defaultColumns = ['id', 'email', 'username', 'roles'];
// const defaultSerializeColumns = [...defaultColumns, 'dateBanned', 'dateBlocked', 'dateEmailVerified']
const { columns } = require('midwest/util/sql');

const serializeColumns = config.serializeColumns && columns(config.serializeColumns, 'users');
const userColumns = config.userColumns && columns(config.userColumns, 'users');

const queries = config.queries || {};

module.exports = {
  create: queries.create || `
    WITH last_user AS (
      INSERT INTO users (given_name, family_name, email, password, date_email_verified)
        VALUES ($1, $2, $3, $4, NOW()) RETURNING id
    ), last_roles AS (
      INSERT INTO user_roles(role_id, user_id) (SELECT unnest($5::int[]), id FROM last_user)
    )

    SELECT id FROM last_user;
  `,
  getAll: queries.getAll || `
    SELECT users.email,
      (SELECT array_to_json(array_agg(row_to_json(d)))
        FROM (
          SELECT id, name FROM roles
            INNER JOIN user_roles ON user_roles.role_id = roles.id
          WHERE user_roles.role_id = users.id
          ORDER BY name ASC
        ) d
      ) as roles
      ${userColumns ? `, ${userColumns}` : ''}
      FROM users;
    `,
  // getAll: queries.getAll || `
  //   SELECT users.email, array_agg(roles.name) as roles
  //     ${userColumns ? `, ${userColumns}` : ''}
  //     FROM users, user_roles, roles
  //     WHERE users.id = user_roles.user_id
  //     AND user_roles.role_id = roles.id
  //     GROUP BY users.email;
  //   `,
  findById: queries.findById || `
    SELECT
        users.email,
        (SELECT array_to_json(array_agg(row_to_json(d)))
          FROM (
            SELECT id, name FROM roles
              INNER JOIN user_roles ON user_roles.role_id = roles.id
            WHERE user_roles.role_id = users.id
            ORDER BY name ASC
          ) d
        ) as roles,
        users.date_verified as "dateVerified",
        users.family_name as "familyName",
        users.given_name as "givenName"
      FROM users, user_roles, roles
      WHERE users.id = user_roles.user_id
        AND user_roles.role_id = roles.id
        AND users.id = $1
      GROUP BY users.email;
    `,
  findByEmail: queries.findByEmail || `
    SELECT users.email, array_agg(roles.name) as roles
      FROM users, user_roles, roles
      WHERE users.id = user_roles.user_id
      AND user_roles.role_id = roles.id
      AND users.email = $1
      GROUP BY users.email;
    `,
  getAuthenticationDetails: queries.getAuthenticationDetails || `
    SELECT
        id,
        email,
        password,
        date_email_verified as "dateEmailVerified",
        date_banned as "dateBanned",
        date_blocked as "dateBlocked",
        array(SELECT name FROM user_roles LEFT OUTER JOIN roles ON user_roles.role_id = roles.id WHERE user_roles.user_id = users.id) as roles
        ${serializeColumns ? `, ${serializeColumns}` : ''}
      FROM users 
      WHERE email = $1;
    `,
  login: queries.login || `
    UPDATE users SET last_login = NOW()
      WHERE email = $1;
    `,
};
