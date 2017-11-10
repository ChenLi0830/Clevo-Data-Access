/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('data.seeding')
const faker = require('faker')
const tag = require('graphql-tag')

function seedUser (client, organization, team, role) {
  const variables = {
    email: faker.internet.email(),
    staffId: faker.random.number(1000),
    password: faker.internet.password(),
    newPassword: faker.internet.password(),
    name: faker.name.findName(),
    title: faker.name.jobTitle(),
    role: role || 'master',
    status: 'active',
    team: team || '59f8b2653d21031560e1ecc2',
    organization: organization || '59f8e428a773be264cffc56f'
  }
  debug('seed user', organization, team, role, variables)
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
        _id,
        email,
        staffId,
        name,
        title,
        role,
        status,
        createdAt,
        updatedAt
      }}
    `,
    variables: variables
  }).then(body => {
    let result = body.data
    debug('seed user', result)
    return {
      _id: result[operationName]._id,
      email: result[operationName].email,
      password: variables.password
    }
  }).catch(error => {
    debug('seed user failed', error)
  })
}

function unseedUser (client, _id) {
  debug('unseed user', _id)
  let operationName = 'userDelete'
  return client.mutate({
    mutation: tag`
      mutation userDelete (
        $_id: String!
      ) { userDelete (
        _id: $_id
      ) {
        recordId
        record {
          _id,
          email,
          staffId,
          name,
          title,
          role,
          status,
          createdAt,
          updatedAt
        }
      }}
    `,
    variables: {
      _id
    }
  }).then(body => {
    let result = body.data
    debug('unseed user', result)
    return {
      _id: result[operationName]._id
    }
  })
}

module.exports = {
  seedUser,
  unseedUser
}
