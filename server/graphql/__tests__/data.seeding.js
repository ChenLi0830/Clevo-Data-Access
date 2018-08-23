/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('data.seeding')
const mongoose = require('mongoose')
const { OrganizationSchema, TeamSchema, UserSchema } = require('../../mongoose')
const faker = require('faker')
const tag = require('graphql-tag')

const organization = new OrganizationSchema({
  name: faker.company.companyName()
})
const team = new TeamSchema({
  name: faker.name.lastName(),
  organization: organization
})
const staff = new UserSchema({
  email: faker.internet.email(),
  staffId: faker.random.number(1000),
  password: faker.internet.password(),
  name: faker.name.findName(),
  title: faker.name.jobTitle(),
  role: 'master',
  status: 'active',
  team: team,
  organization: organization
})

function seed () {
  debug('seeding...', organization, team, staff)
  mongoose.Promise = global.Promise
  let result = {
    email: staff.email,
    password: staff.password
  }
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(doc => {
    debug('mongoose connected successfully')
    // seed staff, team, and organization for test
    return organization.save().then(a => {
      return team.save().then(b => {
        return staff.save().then(c => {
          debug('seeded', c)
          return result
        })
      })
    })
  }, error => {
    debug('mongoose connecting failed', error)
  })
}

function login (client, email, password) {
  debug('logging in...', email, password)
  let operationName = 'userLogin'
  return client.mutate({
    mutation: tag`
      mutation userLogin (
        $email: String!,
        $password:String!
      ) { userLogin (
        email:$email,
        password:$password
      ) {
        _id,
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
    variables: {
      email,
      password
    }
  }).then(body => {
    let result = body.data
    debug('logged in', result)
    return result[operationName]
  })
}

function logout (client) {
  debug('logging out...')
  let operationName = 'userLogout'
  return client.mutate({
    mutation: tag`
    mutation userLogout { userLogout {
      _id
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
    `
  }).then(body => {
    let result = body.data
    debug('logged out', result)
    return result[operationName]
  })
}

function unseed () {
  debug('seeding...', organization, team, staff)
  return staff.remove().then(a => {
    return team.remove().then(b => {
      return organization.remove()
    })
  }).then(result => {
    debug('unseeded')
    return mongoose.disconnect()
  })
}

module.exports = {
  seed,
  unseed,
  login,
  logout
}
