/* eslint-env jest */
require('dotenv').config()

const faker = require('faker')
const rp = require('request-promise')
const PORT = process.env.PORT || 4000
// const app = require('../server')
// const server = app.listen(PORT, () => {
//   console.log('Listening on port: ', PORT)
// })

// beforeAll(() => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('waited 5 sec')
//       resolve(true)
//     }, 5000)
//   })
// })

// afterAll(() => {
//   return server.close()
// })

const variables = {
  orgName: faker.company.companyName(),
  orgStatus: 'active',
  sensitiveWords: faker.lorem.words().split(' '),
  bannedWords: faker.lorem.words().split(' '),
  emotionThreshold: faker.random.number(1),
  ratingThreshold: faker.random.number(5)
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
  let operationName = 'orgCreate'
  return graphqlQuery(operationName, `
    mutation orgCreate($orgName: String, $orgStatus: EnumOrganizationStatus) { orgCreate (record: {
      name: $orgName
      status: $orgStatus
    }) {
      recordId
      record {
        name
        status
        createdAt
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    console.log('create organization', result)
    expect(result[operationName].record.name).toEqual(variables.orgName)
    expect(result[operationName].record.status).toEqual(variables.orgStatus)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})

test('read organization', () => {
  let operationName = 'orgByName'
  return graphqlQuery(operationName, `
    query orgByName($orgName: String!) { orgByName(name: $orgName) {
      _id
      name
      status
      analyticRules {
        emotionThreshold
        ratingThreshold
        bannedWords
        sensitiveWords
      }
    }}
  `).then(body => {
    let result = body.data
    console.log('read organization', result)
    expect(result[operationName].name).toEqual(variables.orgName)
    expect(result[operationName].status).toEqual(variables.orgStatus)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
  })
})

test('delete organization', () => {
  let operationName = 'orgDelByName'
  return graphqlQuery(operationName, `
    mutation orgDelByName ($orgName: String!) { orgDelByName (name: $orgName) {
      recordId
      record {
        name
        status
        createdBy
        createdAt
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    console.log('delete organization', result)
    expect(result[operationName].record.name).toEqual(variables.orgName)
    expect(result[operationName].record.status).toEqual(variables.orgStatus)
  })
})
