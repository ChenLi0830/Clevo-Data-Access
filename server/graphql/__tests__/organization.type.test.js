/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('organization.type.test')
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
  name: faker.company.companyName(),
  status: 'active',
  analyticRules: {
    sensitiveWords: faker.lorem.words().split(' '),
    bannedWords: faker.lorem.words().split(' '),
    emotionThreshold: faker.random.number(1),
    ratingThreshold: faker.random.number(5)
  }
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

test('create organization', () => {
  let operationName = 'organizationCreate'
  return graphqlQuery(operationName, `
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
  `).then(body => {
    let result = body.data
    debug('create organization', result)
    variables.id = result[operationName].recordId
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
  return graphqlQuery(operationName, `
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
  `).then(body => {
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
  return graphqlQuery(operationName, `
    mutation organizationUpdate(
      $id: MongoID!,
      $status: EnumOrganizationStatus
    ) { organizationUpdate (record: {
      _id: $id,
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
  `).then(body => {
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
  let operationName = 'organizationDeleteByName'
  return graphqlQuery(operationName, `
    mutation organizationDeleteByName ($name: String!) { organizationDeleteByName (name: $name) {
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
  `).then(body => {
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
