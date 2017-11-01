/* eslint-env jest */
require('dotenv').config()

const mongoose = require('mongoose')
const faker = require('faker')

beforeAll(() => {
  mongoose.Promise = global.Promise
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(result => {
    console.log('mongoose connected successfully')
  }, error => {
    console.log('mongoose connecting failed', error)
  })
})

afterAll(() => {
  return mongoose.disconnect()
  // let collection = mongoose.connection.collections['organizations']
  // return collection.drop().then(result => {
  //   console.log('test collection dropped successfully', result)
  //   return result
  // }, error => {
  //   console.log('test collection dropping failed', error)
  // })
})

const Organization = require('./organization')
const orgName = faker.company.companyName()
const orgStatus = 'active'
const sensitiveWords = faker.lorem.words().split(' ')
const bannedWords = faker.lorem.words().split(' ')
const emotionThreshold = faker.random.number(1)
const ratingThreshold = faker.random.number(5)
let org = new Organization({
  name: orgName,
  status: orgStatus,
  analyticRules: {
    sensitiveWords,
    bannedWords,
    emotionThreshold,
    ratingThreshold
  }
})

test('create organization', () => {
  return org.save().then(result => {
    console.log('create organization', org)
    expect(result.name).toEqual(orgName)
    expect(result.status).toEqual(orgStatus)
    expect(result.createdAt).toEqual(result.updatedAt)
    expect(result.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(ratingThreshold)
  })
})

test('read organization', () => {
  return Organization.findById(org._id).then(result => {
    console.log('read organization', org)
    expect(result.name).toEqual(orgName)
    expect(result.status).toEqual(orgStatus)
    expect(result.analyticRules.sensitiveWords).toEqual(expect.arrayContaining(sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(ratingThreshold)
  })
})

test('update organization', () => {
  return Organization.findByIdAndUpdate(org._id, {
    'analyticRules.sensitiveWords': faker.lorem.words().split(' ')
  }, {
    new: true
  }).then(result => {
    console.log('update organization', result)
    expect(result.name).toEqual(orgName)
    expect(result.status).toEqual(orgStatus)
    expect(result.analyticRules.sensitiveWords).not.toEqual(expect.arrayContaining(sensitiveWords))
    expect(result.analyticRules.bannedWords).toEqual(expect.arrayContaining(bannedWords))
    expect(result.analyticRules.emotionThreshold).toEqual(emotionThreshold)
    expect(result.analyticRules.ratingThreshold).toEqual(ratingThreshold)
  })
})

test('delete organization', () => {
  return Organization.findByIdAndRemove(org._id).then(result => {
    console.log('delete organization', result)
  })
})
