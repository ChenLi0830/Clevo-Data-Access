/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('user.type.test')
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
  newPassword: faker.internet.password(),
  name: faker.name.findName(),
  title: faker.name.jobTitle(),
  role: 'admin',
  status: 'active',
  team: '59f8b2653d21031560e1ecc2',
  organization: '59f8e428a773be264cffc56f'
}

// Todo: check if organization member will be added automatically when a new user is created
test('create user', () => {
  let operationName = 'userSignup'
  return client.mutate({
    mutation: tag`
      mutation userSignup(
        $email: String!,
        $password: String!,
        $staffId: String!,
        $name: String!, 
        $title: String,
        $role: EnumUserRole,
        $status: EnumUserStatus,
        $team: MongoID!
      ) { userSignup (
        email: $email,
        password: $password,
        staffId: $staffId,
        name: $name,
        title: $title,
        role: $role,
        status: $status,
        team: $team
      ) {
        email,
        staffId,
        name,
        title,
        role,
        status
        createdAt,
        updatedAt
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('create user', result)
    expect(result[operationName].email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].title).toEqual(variables.title)
    expect(result[operationName].role).toEqual(variables.role)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
  })
})

test('read user', () => {
  let operationName = 'userByEmail'
  return client.query({
    query: tag`
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
    `,
    variables
  }).then(body => {
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

// Todo: test changePassword method for both success and failure scenarios
test('changePassword', () => {
  let operationName = 'userChangePassword'
  return client.mutate({
    mutation: tag`
      mutation userChangePassword (
        $password: String!,
        $newPassword: String!
      ) { userChangePassword (
        oldPassword: $password,
        newPassword: $newPassword
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
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('changePassword', result)
    expect(result[operationName].email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].name).toEqual(variables.name)
    expect(result[operationName].title).toEqual(variables.title)
    expect(result[operationName].role).toEqual(variables.role)
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].createdAt).not.toEqual(result[operationName].updatedAt)
  })
})

test('resetPassword', () => {
  let operationName = 'userResetPassword'
  return client.mutate({
    mutation: tag`
      mutation userResetPassword { userResetPassword }
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('resetPassword', result)
    expect(result[operationName]).toEqual(expect.any(String))
  })
})

// Todo: check if organization member will be removed automatically when a new user is created
test('delete user', () => {
  let operationName = 'userDeleteByEmail'
  return client.mutate({
    mutation: tag`
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
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('delete user', result)
    expect(result[operationName].record.email).toEqual(variables.email.toLocaleLowerCase())
    expect(result[operationName].record.staffId).toEqual(variables.staffId.toString())
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.title).toEqual(variables.title)
    expect(result[operationName].record.role).toEqual(variables.role)
    expect(result[operationName].record.status).toEqual(variables.status)
  })
})
