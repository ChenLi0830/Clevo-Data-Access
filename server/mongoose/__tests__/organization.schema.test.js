/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('organization.schema.test')
const mongoose = require('mongoose')
const faker = require('faker')
const { OrganizationSchema } = require('../')

const name = faker.company.companyName()
const status = 'active'
const analyticRules = {
  sensitiveWords: faker.lorem.words().split(' '),
  bannedWords: faker.lorem.words().split(' '),
  emotionThreshold: faker.random.number(1),
  ratingThreshold: faker.random.number(5)
}

let organization = new OrganizationSchema({
  name,
  status,
  analyticRules
})

beforeAll(() => {
  mongoose.Promise = global.Promise
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(result => {
    debug('mongoose connected successfully')
  }, error => {
    debug('mongoose connecting failed', error)
  })
})

afterAll(() => {
  return mongoose.disconnect()
})

test('create organization', () => {
  return organization.save().then(result => {
    debug('create organization', organization)
    expect(result.createdAt).toEqual(result.updatedAt)
    expect(result.name).toEqual(name)
    expect(result.status).toEqual(status)
    expect(result.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(analyticRules.sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(analyticRules.bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(analyticRules.emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(analyticRules.ratingThreshold)
  })
})

test('read organization', () => {
  return OrganizationSchema.findById(organization.id).then(result => {
    debug('read organization', result)
    expect(result.name).toEqual(name)
    expect(result.status).toEqual(status)
    expect(result.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(analyticRules.sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(analyticRules.bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(analyticRules.emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(analyticRules.ratingThreshold)
  })
})

test('update organization', () => {
  return OrganizationSchema.findByIdAndUpdate(organization.id, {
    'analyticRules.sensitiveWords': faker.lorem.words().split(' ')
  }, {
    new: true
  }).then(result => {
    debug('update organization', result)
    expect(result.name).toEqual(name)
    expect(result.status).toEqual(status)
    expect(result.analyticRules.sensitiveWords).not.toEqual(expect.arrayContaining(analyticRules.sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(analyticRules.bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(analyticRules.emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(analyticRules.ratingThreshold)
  })
})

test('delete organization', () => {
  return OrganizationSchema.findById(organization.id).exec().then(record => {
    return record.remove().then(result => {
      debug('delete organization', result)
    })
  })
})
