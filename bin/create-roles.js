#!/bin/env node

'use strict'

global.PWD = process.env.NODE_PWD || process.cwd()
global.ENV = process.env.NODE_ENV || 'development'

const p = require('path')

require('app-module-path').addPath(p.join(PWD, 'node_modules'))

const _ = require('lodash')
const chalk = require('chalk')
const pg = require('pg')

const postgresConfig = require(p.join(PWD, 'server/config/postgres'))

const client = new pg.Client(postgresConfig)

const successPrefix = `[${chalk.green('SUCCESS')}] `
// const errorPrefix = `[${chalk.red('ERROR')}] `;

function createRoles (roles) {
  const roleNames = (roles ? roles.split(',') : ['user', 'admin'])

  const close = _.after(roleNames.length, () => client.end())

  client.connect((err) => {
    if (err) throw err

    roleNames.forEach((role) => {
      client.query(`INSERT INTO roles (name) VALUES ('${role}')`, (err) => {
        if (err) throw err

        console.log(`${successPrefix}Created role ${chalk.bold.blue(role)}`)

        close()
      })
    })
  })
}

createRoles()
