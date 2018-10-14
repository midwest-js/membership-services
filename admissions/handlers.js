'use strict'

const _ = require('lodash')
const factory = require('@bmp/pg/handlers')
const { one, many } = require('@bmp/pg/result')

const columns = ['id', 'regex', 'createdAt', 'createdById', 'modifiedAt']
const resolver = require('deep-equal-resolver')()

const queries = require('./sql')

module.exports = _.memoize((state) => {
  const handlers = factory({
    db: state.db,
    emitter: state.emitter,
    table: 'admissions',
    exclude: [ 'create', 'find', 'findById' ],
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
    create (json, client = state.db) {
      return client.query(queries.create, [json.regex, json.createdById, json.roles]).then(one)
    },

    // simple find without search functionality
    find (json, client = state.db) {
      const offset = Math.max(0, json.offset)

      return client.query(queries.find, [offset]).then(many)
    },

    // simple find by id without search functionality
    findById (id, client = state.db) {
      return client.query(queries.findById, [ id ]).then(one)
    },

    findMatches,
  })
}, resolver)
