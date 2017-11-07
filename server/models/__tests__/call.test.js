/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('call.test')
const mongoose = require('mongoose')
const faker = require('faker')

const Organization = require('../organization')
const organization = new Organization({
  name: faker.company.companyName()
})
const Team = require('../team')
const team = new Team({
  name: faker.name.lastName()
})
const User = require('../user')
const staff = new User({
  email: faker.internet.email(),
  staffId: faker.random.number(1000),
  password: faker.internet.password(),
  name: faker.name.findName(),
  title: faker.name.jobTitle(),
  role: 'staff',
  status: 'active',
  team: team,
  organization: organization
})
const status = 'active'
const format = 'mp3'
const encoding = 'pcm'
const source = faker.internet.url()
const startedAt = faker.date.past()
const transcription = {
  processor: 'iflytek',
  taskId: faker.random.uuid(),
  status: 'completed',
  result: [{ 'bg': '0', 'ed': '4000', 'onebest': '您好，主持人，您服务，请问有什么能帮您的吗？', 'speaker': '2' }, { 'bg': '4050', 'ed': '8660', 'onebest': '嗯我这怎么在你这儿消费了15块钱是怎么治。', 'speaker': '1' }, { 'bg': '8780', 'ed': '13130', 'onebest': '噢您是手机话费扣的款还是什么课的款？先生。', 'speaker': '2' }, { 'bg': '13420', 'ed': '17990', 'onebest': '我也不清楚，啊我把移动移动刚刚说等你们问问。', 'speaker': '1' }, { 'bg': '18910', 'ed': '20200', 'onebest': '您稍等。', 'speaker': '2' }, { 'bg': '20610', 'ed': '22210', 'onebest': '啊对，啊嗯', 'speaker': '1' }, { 'bg': '22250', 'ed': '23520', 'onebest': '帮我看看。', 'speaker': '1' }, { 'bg': '24050', 'ed': '30940', 'onebest': '您好，吧现在是您在您说这个您来电的手机号被扣款了是吗？也无所谓。吧。', 'speaker': '2' }, { 'bg': '30960', 'ed': '32320', 'onebest': '好的，你说的。', 'speaker': '1' }]
}
const emotion = {
  processor: 'clevo',
  taskId: faker.random.uuid(),
  status: 'processing',
  result: undefined
}
const nlp = {
  processor: 'other',
  taskId: faker.random.uuid(),
  status: 'started',
  result: undefined
}
const statistics = {
  speechDuration: 900 + faker.random.number(100),
  slienceDuration: faker.random.number(200),
  staffTalkDuraion: faker.random.number(500),
  customerTalkDuration: faker.random.number(500)
}
const scores = {
  politeness: faker.random.number(5),
  scripts: faker.random.number(5),
  emotion: faker.random.number(5),
  overall: faker.random.number(5)
}
const breakdowns = [{
  begin: 0,
  end: faker.random.number(10),
  transcript: faker.lorem.paragraph(1),
  emotion: [
    faker.random.number(5),
    faker.random.number(5)
  ],
  intent: faker.lorem.word(),
  speaker: 'staff',
  bannedWords: [
    faker.random.word()
  ],
  sensitiveWords: []
}, {
  begin: 10,
  end: 10 + faker.random.number(10),
  transcript: faker.lorem.paragraph(1),
  emotion: [
    faker.random.number(5),
    faker.random.number(5)
  ],
  intent: faker.lorem.word(),
  speaker: 'customer',
  bannedWords: [],
  sensitiveWords: [
    faker.random.word()
  ]
}]
const subject = faker.lorem.word()

const Call = require('../call')
let call = new Call({
  staff,
  organization,
  status,
  format,
  encoding,
  source,
  startedAt,
  transcription,
  emotion,
  nlp,
  statistics,
  scores,
  breakdowns,
  subject
})

beforeAll(() => {
  mongoose.Promise = global.Promise
  return mongoose.connect(process.env.MONGO_URI, {
    useMongoClient: true
  }).then(result => {
    debug('mongoose connected successfully')
    // seed staff and organization for test
    return organization.save().then(a => {
      return team.save().then(b => {
        return staff.save()
      })
    })
  }, error => {
    debug('mongoose connecting failed', error)
  })
})

afterAll(() => {
  // cleanup staff and organization for test
  return staff.remove().then(a => {
    return team.remove().then(b => {
      return organization.remove()
    })
  }).then(result => {
    return mongoose.disconnect()
  })
})

test('create call', () => {
  return call.save().then(result => {
    debug('create call', call)
    expect(result.createdAt).toEqual(result.updatedAt)
    // expect(result.staff).toEqual(expect.objectContaining(staff))
    // expect(result.organization).toEqual(expect.objectContaining(organization))
    expect(result.status).toEqual(status)
    expect(result.format).toEqual(format)
    expect(result.encoding).toEqual(encoding)
    expect(result.source).toEqual(source)
    expect(result.startedAt).toEqual(startedAt)
    expect(result.transcription.toJSON()).toEqual(transcription)
    expect(result.emotion.toJSON()).toEqual(emotion)
    expect(result.nlp.toJSON()).toEqual(nlp)
    expect(result.statistics.toJSON()).toEqual(statistics)
    expect(result.scores.toJSON()).toEqual(scores)
    expect(result.breakdowns.length).toBe(breakdowns.length)
    // result.breakdowns.forEach((breakdown, i) => {
    //   expect(breakdown).toEqual(expect.objectContaining(breakdowns[i]))
    // })
    expect(result.subject).toEqual(subject)
  })
})

test('read call', () => {
  return Call.findById(call.id).populate('staff').populate('organization').exec().then(result => {
    debug('read call', result)
    expect(result.createdAt).toEqual(result.updatedAt)
    // expect(result.staff.toJSON()).toEqual(expect.objectContaining(staff))
    // expect(result.organization.toJSON()).toEqual(expect.objectContaining(organization))
    expect(result.status).toEqual(status)
    expect(result.format).toEqual(format)
    expect(result.encoding).toEqual(encoding)
    expect(result.source).toEqual(source)
    expect(result.startedAt).toEqual(startedAt)
    expect(result.transcription.toJSON()).toEqual(transcription)
    expect(result.emotion.toJSON()).toEqual(emotion)
    expect(result.nlp.toJSON()).toEqual(nlp)
    expect(result.statistics.toJSON()).toEqual(statistics)
    expect(result.scores.toJSON()).toEqual(scores)
    expect(result.breakdowns.length).toBe(breakdowns.length)
    // result.breakdowns.forEach((breakdown, i) => {
    //   expect(breakdown).toEqual(expect.objectContaining(breakdowns[i]))
    // })
    expect(result.subject).toEqual(subject)
  })
})

test('update call', () => {
  return Call.findByIdAndUpdate(call.id, {
    'emotion.status': 'completed',
    'emotion.result': {
      scores: [1, 2, 3, 4, 5]
    }
  }, {
    new: true
  }).populate('staff').populate('organization').exec().then(result => {
    debug('update call', result)
    expect(result.createdAt).not.toEqual(result.updatedAt)
    // expect(result.staff.toJSON()).toEqual(expect.objectContaining(staff))
    // expect(result.organization.toJSON()).toEqual(expect.objectContaining(organization))
    expect(result.status).toEqual(status)
    expect(result.format).toEqual(format)
    expect(result.encoding).toEqual(encoding)
    expect(result.source).toEqual(source)
    expect(result.startedAt).toEqual(startedAt)
    expect(result.transcription.toJSON()).toEqual(transcription)
    expect(result.emotion.toJSON()).not.toEqual(emotion)
    expect(result.nlp.toJSON()).toEqual(nlp)
    expect(result.statistics.toJSON()).toEqual(statistics)
    expect(result.scores.toJSON()).toEqual(scores)
    expect(result.breakdowns.length).toBe(breakdowns.length)
    // result.breakdowns.forEach((breakdown, i) => {
    //   expect(breakdown).toEqual(expect.objectContaining(breakdowns[i]))
    // })
    expect(result.subject).toEqual(subject)
  })
})

test('delete call', () => {
  return Call.findById(call.id).exec().then(record => {
    return record.remove().then(result => {
      debug('delete call', result)
    })
  })
})
