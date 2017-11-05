/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('team.test')
const mongoose = require('mongoose')
const faker = require('faker')

const Organization = require('../organization')
const organization = new Organization({
  name: faker.company.companyName()
})
const name = faker.name.lastName()
const status = 'active'

const Team = require('../team')
const team = new Team({
  name,
  status
})

beforeAll(() => {
  mongoose.Promise = global.Promise
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(result => {
    debug('mongoose connected successfully')
    // seed organization for test
    return organization.save()
  }, error => {
    debug('mongoose connecting failed', error)
  })
})

afterAll(() => {
  // cleanup organization for test
  return organization.remove().then(result => {
    return mongoose.disconnect()
  })
})

test('create team', () => {
  return team.save().then(result => {
    debug('create team', result)
    expect(result.createdAt).toEqual(result.updatedAt)
    expect(result.name).toEqual(name)
    expect(result.status).toEqual(status)
  })
})

// test('update team', () => {
//   return Team.findById(team.id).exec().then(record => {
//     record.organization = '59f8e428a773be264cffc56f'
//     return record.save().then(result => {
//       debug('update team', result)
//     })
//   })
// })

test('delete team', () => {
  return Team.findById(team.id).exec().then(record => {
    return record.remove().then(result => {
      debug('delete team', result)
    })
  })
})
