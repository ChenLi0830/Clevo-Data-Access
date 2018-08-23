/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('organization.type.test')
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

const variables = {
  name: faker.company.companyName(),
  status: 'active',
  analyticRules: {
    sensitiveWords: faker.lorem.words().split(' '),
    bannedWords: faker.lorem.words().split(' '),
    emotionThreshold: faker.random.number(1),
    ratingThreshold: faker.random.number(5)
  }
}

const { seed, unseed, login, logout } = require('./data.seeding')
// const app = require('../server')
// let server = null

beforeAll(() => {
  return seed().then(result => {
    return login(client, result.email, result.password).then(result => {
    })
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
  return logout(client).then(result => {
    return unseed()
  })
//   return new Promise((resolve, reject) => {
//     server.close(() => {
//       debug('Server closed on port: ', PORT)
//       resolve()
//     })
//   })
})

test('create organization', () => {
  let operationName = 'organizationCreate'
  return client.mutate({
    mutation: tag`
      mutation organizationCreate(
        $name: String, 
        $status: EnumOrganizationStatus, 
        $analyticRules: OrganizationAnalyticRulesInput
      ) { organizationCreate (record: {
        name: $name
        status: $status
        analyticRules: $analyticRules
      }) {
        recordId
        record {
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
        }
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('create organization', result)
    variables._id = result[operationName].recordId
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
    expect(result[operationName].record.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(variables.analyticRules.sensitiveWords))
    expect(result[operationName].record.analyticRules.bannedWords).toEqual(expect.arrayContaining(variables.analyticRules.bannedWords))
    expect(result[operationName].record.analyticRules.emotionThreshold).toEqual(variables.analyticRules.emotionThreshold)
    expect(result[operationName].record.analyticRules.ratingThreshold).toEqual(variables.analyticRules.ratingThreshold)
  })
})

test('read organization', () => {
  let operationName = 'organizationByName'
  return client.query({
    query: tag`
      query organizationByName(
        $name: String!
      ) { organizationByName(
        name: $name
      ) {
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
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('read organization', result)
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
    expect(result[operationName].analyticRules.sensitiveWords).toEqual(expect.arrayContaining(variables.analyticRules.sensitiveWords))
    expect(result[operationName].analyticRules.bannedWords).toEqual(expect.arrayContaining(variables.analyticRules.bannedWords))
    expect(result[operationName].analyticRules.emotionThreshold).toEqual(variables.analyticRules.emotionThreshold)
    expect(result[operationName].analyticRules.ratingThreshold).toEqual(variables.analyticRules.ratingThreshold)
  })
})

test('update organization', () => {
  let operationName = 'organizationUpdate'
  variables.status = 'inactive'
  return client.mutate({
    mutation: tag`
      mutation organizationUpdate(
        $_id: MongoID!,
        $status: EnumOrganizationStatus
      ) { organizationUpdate (record: {
        _id: $_id,
        status: $status
      }) {
        recordId
        record {
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
        }
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('update organization', result)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).not.toEqual(result[operationName].record.updatedAt)
    expect(result[operationName].record.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(variables.analyticRules.sensitiveWords))
    expect(result[operationName].record.analyticRules.bannedWords).toEqual(expect.arrayContaining(variables.analyticRules.bannedWords))
    expect(result[operationName].record.analyticRules.emotionThreshold).toEqual(variables.analyticRules.emotionThreshold)
    expect(result[operationName].record.analyticRules.ratingThreshold).toEqual(variables.analyticRules.ratingThreshold)
  })
})

test('delete organization', () => {
  let operationName = 'organizationDelete'
  return client.mutate({
    mutation: tag`
      mutation organizationDelete (
        $_id: MongoID!
      ) { organizationDelete (
        _id: $_id
      ) {
        recordId
        record {
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
        }
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('delete organization', result)
    expect(result[operationName].record.name).toEqual(variables.name)
    // expect(result[operationName].record.status).toEqual(variables.status)
    // expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
    expect(result[operationName].record.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(variables.analyticRules.sensitiveWords))
    expect(result[operationName].record.analyticRules.bannedWords).toEqual(expect.arrayContaining(variables.analyticRules.bannedWords))
    expect(result[operationName].record.analyticRules.emotionThreshold).toEqual(variables.analyticRules.emotionThreshold)
    expect(result[operationName].record.analyticRules.ratingThreshold).toEqual(variables.analyticRules.ratingThreshold)
  })
})
