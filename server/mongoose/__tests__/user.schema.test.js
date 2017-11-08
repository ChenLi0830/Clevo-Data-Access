/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('user.schema.test')
const mongoose = require('mongoose')
const faker = require('faker')
const { OrganizationSchema, TeamSchema, UserSchema } = require('../')

const organization = new OrganizationSchema({
  name: faker.company.companyName()
})
const team = new TeamSchema({
  name: faker.name.lastName()
})
const email = faker.internet.email()
const staffId = faker.random.number(1000)
const password = faker.internet.password()
const name = faker.name.findName()
const title = faker.name.jobTitle()
const role = 'staff'
const status = 'active'

const user = new UserSchema({
  email,
  staffId,
  password,
  name,
  title,
  role,
  status,
  team,
  organization
})

beforeAll(() => {
  mongoose.Promise = global.Promise
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(result => {
    debug('mongoose connected successfully')
    // seed team and organization for test
    return organization.save().then(a => {
      return team.save()
    })
  }, error => {
    debug('mongoose connecting failed', error)
  })
})

afterAll(() => {
  // cleanup team and organization for test
  return team.remove().then(a => {
    return organization.remove()
  }).then(result => {
    return mongoose.disconnect()
  })
})

test('create user', () => {
  return user.save().then(result => {
    debug('create user', result)
    expect(result.createdAt).toEqual(result.updatedAt)
    expect(result.email).toEqual(email.toLocaleLowerCase())
    expect(result.staffId).toEqual(staffId.toString())
    expect(result.password).not.toEqual(password)
    expect(result.name).toEqual(name)
    expect(result.title).toEqual(title)
    expect(result.role).toEqual(role)
    expect(result.status).toEqual(status)
  })
})

// test('update user', () => {
//   return User.findById(user.id).exec().then(record => {
//     record.team = '59f8b2653d21031560e1ecc2'
//     return record.save().then(result => {
//       debug('update user', result)
//     })
//   })
// })

test('delete user', () => {
  return UserSchema.findById(user.id).exec().then(record => {
    return record.remove().then(result => {
      debug('delete user', result)
    })
  })
})
