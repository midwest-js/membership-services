'use strict'

const _ = require('lodash')
const factory = require('@bmp/pg/handlers')
const { many } = require('@bmp/pg/result')

const columns = ['id', 'regex', 'createdAt', 'createdById', 'modifiedAt']
const resolver = require('deep-equal-resolver')()
const queries = require('./sql')

// modules > project
module.exports = _.memoize((state) => {
  const handlers = factory({
    db: state.db,
    emitter: state.emitter,
    table: 'admissions',
    columns,
  })

  function findMatches (email, client = state.db) {
    return client.query(queries.getAll).then(many).then((admissions) => {
      if (admissions) {
        admissions = admissions.filter((admission) => {
          const regex = new RegExp(admission.regex)

          return regex.test(email)
        })

        if (!admissions.length) admissions = undefined
      }

      return admissions
    })
  }

  return Object.assign(handlers, {
    findMatches,
  })
}, resolver)
