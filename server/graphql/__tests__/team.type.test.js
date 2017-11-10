/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('team.type.test')
const faker = require('faker')
const rp = require('request-promise')
const PORT = process.env.PORT || 4000
// const app = require('../server')
// let server = null

// beforeAll(() => {
//   return new Promise((resolve, reject) => {
//     server = app.listen(PORT, () => {
//       debug('Server started on port: ', PORT)
//       setTimeout(() => {
//         resolve()
//       }, 5000)
//     })
//   })
// })

// afterAll(() => {
//   return new Promise((resolve, reject) => {
//     server.close(() => {
//       debug('Server closed on port: ', PORT)
//       resolve()
//     })
//   })
// })

const variables = {
  name: faker.name.lastName(),
  status: 'active',
  organization: '59f8e428a773be264cffc56f'
}

function graphqlQuery (name, query) {
  return rp({
    method: 'POST',
    uri: 'http://localhost:' + PORT + '/graphql',
    body: {
      operationName: name,
      query: query,
      variables: variables
    },
    json: true
  })
}

test('create team', () => {
  let operationName = 'teamCreate'
  return graphqlQuery(operationName, `
    mutation teamCreate(
      $name: String, 
      $status: EnumTeamStatus,
      $organization: MongoID
    ) { teamCreate (record: {
      name: $name,
      status: $status,
      organization: $organization
    }) {
      recordId
      record {
        name,
        status,
        organization {
          _id
          name
          status
          createdAt
          updatedAt
          analyticRules {
            emotionThreshold
            ratingThreshold
            bannedWords
            sensitiveWords
          }
        },
        createdAt,
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    debug('create team', body)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})

test('read team', () => {
  let operationName = 'teamByName'
  return graphqlQuery(operationName, `
    query teamByName(
      $name: String!
    ) { teamByName(
      name: $name
    ) {
      name,
      status,
      organization {
        _id
        name
        status
        createdAt
        updatedAt
        analyticRules {
          emotionThreshold
          ratingThreshold
          bannedWords
          sensitiveWords
        }
      },
      createdAt,
      updatedAt
    }}
  `).then(body => {
    let result = body.data
    debug('read team', body)
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
  })
})

test('delete team', () => {
  let operationName = 'teamDeleteByName'
  return graphqlQuery(operationName, `
    mutation teamDeleteByName (
      $name: String!
    ) { teamDeleteByName (
      name: $name
    ) {
      recordId
      record {
        name,
        status,
        organization {
          _id
          name
          status
          createdAt
          updatedAt
          analyticRules {
            emotionThreshold
            ratingThreshold
            bannedWords
            sensitiveWords
          }
        },
        createdAt,
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    debug('delete team', body)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})
