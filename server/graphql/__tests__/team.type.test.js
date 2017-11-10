/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('team.type.test')
const faker = require('faker')
const tag = require('graphql-tag')
const { ApolloClient, HttpLink, InMemoryCache } = require('apollo-client-preset')
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:' + (process.env.PORT || 4000) + '/graphql',
    credentials: 'same-origin',
    fetch: require('fetch-cookie/node-fetch')(require('node-fetch'))
  }),
  cache: new InMemoryCache()
})

const { seedUser, unseedUser } = require('./data.seeding')
let user = {}

// const app = require('../server')
// let server = null

beforeAll(() => {
  return seedUser(client, undefined, undefined, undefined).then(result => {
    user = result
  })
//   return new Promise((resolve, reject) => {
//     server = app.listen(PORT, () => {
//       debug('Server started on port: ', PORT)
//       setTimeout(() => {
//         resolve()
//       }, 5000)
//     })
//   })
})

afterAll(() => {
  return unseedUser(client, user._id)
//   return new Promise((resolve, reject) => {
//     server.close(() => {
//       debug('Server closed on port: ', PORT)
//       resolve()
//     })
//   })
})

const variables = {
  name: faker.name.lastName(),
  status: 'active',
  organization: '59f8e428a773be264cffc56f'
}

test('create team', () => {
  let operationName = 'teamCreate'
  return client.mutate({
    mutation: tag`
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
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('create team', body)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})

test('read team', () => {
  let operationName = 'teamByName'
  return client.query({
    query: tag`
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
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('read team', body)
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
  })
})

test('delete team', () => {
  let operationName = 'teamDeleteByName'
  return client.mutate({
    mutation: tag`
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
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('delete team', body)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})
