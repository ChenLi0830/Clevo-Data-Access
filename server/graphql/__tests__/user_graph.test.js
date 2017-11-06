/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('user_graph.test')
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
  email: faker.internet.email(),
  staffId: faker.random.number(1000),
  password: faker.internet.password(),
  name: faker.name.findName(),
  title: faker.name.jobTitle(),
  role: 'staff',
  status: 'active',
  team: '59f8b2653d21031560e1ecc2',
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

test('create user', () => {
  let operationName = 'userSignup'
  return graphqlQuery(operationName, `
    mutation userSignup(
      $email: String!,
      $password: String!,
      $staffId: String!,
      $name: String!, 
      $title: String,
      $role: EnumUserRole,
      $status: EnumUserStatus,
      $team: MongoID!,
      $organization: MongoID!
    ) { userSignup (
      email: $email,
      password: $password,
      staffId: $staffId,
      name: $name,
      title: $title,
      role: $role,
      status: $status,
      team: $team,
      organization: $organization
    ) {
      recordId
      record {
        email,
        staffId,
        name,
        title,
        role,
        status,
        team {
          _id,
          name,
          status,
          createdAt,
          updatedAt
        },
        organization {
          _id,
          name,
          status,
          createdAt,
          updatedAt,
          analyticRules {
            emotionThreshold,
            ratingThreshold,
            bannedWords,
            sensitiveWords
          }
        },
        createdAt,
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    debug('create user', result)
    expect(result[operationName].record.email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].record.staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.title).toEqual(variables.title)
    expect(result[operationName].record.role).toEqual(variables.role)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})

test('read user', () => {
  let operationName = 'userByEmail'
  return graphqlQuery(operationName, `
    query userByEmail(
      $email: String!
    ) { userByEmail(
      email: $email
    ) {
      email,
      staffId,
      name,
      title,
      role,
      status,
      team {
        _id,
        name,
        status,
        createdAt,
        updatedAt
      },
      organization {
        _id,
        name,
        status,
        createdAt,
        updatedAt,
        analyticRules {
          emotionThreshold,
          ratingThreshold,
          bannedWords,
          sensitiveWords
        }
      },
      createdAt,
      updatedAt
    }}
  `).then(body => {
    let result = body.data
    debug('read user', result)
    expect(result[operationName].email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].title).toEqual(variables.title)
    expect(result[operationName].role).toEqual(variables.role)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
  })
})

test('read users by team', () => {
  let operationName = 'users'
  return graphqlQuery(operationName, `
    query users(
      $team: MongoID
    ) { users(
      filter: {
        team: $team
      }
    ) {
      email,
      staffId,
      name,
      title,
      role,
      status,
      team {
        _id,
        name,
        status,
        createdAt,
        updatedAt
      },
      organization {
        _id,
        name,
        status,
        createdAt,
        updatedAt,
        analyticRules {
          emotionThreshold,
          ratingThreshold,
          bannedWords,
          sensitiveWords
        }
      },
      createdAt,
      updatedAt
    }}
  `).then(body => {
    let result = body.data
    debug('read users by team', result)
    expect(result[operationName].length).toBeGreaterThanOrEqual(1)
  })
})

test('read users by organization', () => {
  let operationName = 'users'
  return graphqlQuery(operationName, `
    query users(
      $organization: MongoID
    ) { users(
      filter: {
        organization: $organization
      }
    ) {
      email,
      staffId,
      name,
      title,
      role,
      status,
      team {
        _id,
        name,
        status,
        createdAt,
        updatedAt
      },
      organization {
        _id,
        name,
        status,
        createdAt,
        updatedAt,
        analyticRules {
          emotionThreshold,
          ratingThreshold,
          bannedWords,
          sensitiveWords
        }
      },
      createdAt,
      updatedAt
    }}
  `).then(body => {
    let result = body.data
    debug('read users by organization', result)
    expect(result[operationName].length).toBeGreaterThanOrEqual(1)
  })
})

test('delete user', () => {
  let operationName = 'userDeleteByEmail'
  return graphqlQuery(operationName, `
    mutation userDeleteByEmail (
      $email: String!
    ) { userDeleteByEmail (
      email: $email
    ) {
      recordId
      record {
        email,
        staffId,
        name,
        title,
        role,
        status,
        team {
          _id,
          name,
          status,
          createdAt,
          updatedAt
        },
        organization {
          _id,
          name,
          status,
          createdAt,
          updatedAt,
          analyticRules {
            emotionThreshold,
            ratingThreshold,
            bannedWords,
            sensitiveWords
          }
        },
        createdAt,
        updatedAt
      }
    }}
  `).then(body => {
    let result = body.data
    debug('delete user', result)
    expect(result[operationName].record.email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].record.staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].record.password).not.toEqual(variables.password)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.title).toEqual(variables.title)
    expect(result[operationName].record.role).toEqual(variables.role)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
  })
})
