#!/bin/env node

'use strict'

global.PWD = process.env.NODE_PWD || process.cwd()
global.ENV = process.env.NODE_ENV || 'development'

const p = require('path')

require('app-module-path').addPath(p.join(PWD, 'node_modules'))

const chalk = require('chalk')
const dbFactory = require('easy-postgres')

const config = {
  postgres: require(p.join(PWD, 'server/config/postgres')),
  site: require(p.join(PWD, 'server/config/site')),
  smtp: require(p.join(PWD, 'server/config/smtp')),
  membership: require(p.join(PWD, 'server/config/membership'))
}

const db = dbFactory(config.postgres)

const successPrefix = `[${chalk.green('SUCCESS')}]`
// const errorPrefix = `[${chalk.red('ERROR')}]`

const { create } = require('../users/handlers')(Object.assign({ db }, config.membership))

function createUser (email, password, roles = 'admin,user') {
  if (!email || !password) {
    console.log('Usage: bin/create-user.js [email] [password] [?roles]')
    process.exit(1)
  }

  create({
    givenName: 'Linus',
    familyName: 'Miller',
    email,
    password,
    roles: roles.split(','),
    emailVerifiedAt: new Date()
  }).then((user) => {
    console.log(`${successPrefix} Created user ${chalk.bold.blue(user.email)} with roles ${user.roles.map((role) => chalk.bold.red(role.name)).join(', ')}`)
  }).catch(console.error).then(() => db.end())
}

createUser(...process.argv.slice(2))
