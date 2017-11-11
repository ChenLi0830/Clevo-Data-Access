/* eslint-env jest */
require('dotenv').config()

const debug = require('debug')('call.type.test')
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

const variables = {
  id: undefined,
  staff: undefined,
  organization: undefined,
  status: 'active',
  format: 'mp3',
  encoding: 'pcm',
  source: faker.internet.url(),
  startedAt: faker.date.past(),
  transcription: {
    processor: 'iflytek',
    taskId: faker.random.uuid(),
    status: 'completed',
    result: [{ 'bg': '0', 'ed': '4000', 'onebest': '您好，主持人，您服务，请问有什么能帮您的吗？', 'speaker': '2' }, { 'bg': '4050', 'ed': '8660', 'onebest': '嗯我这怎么在你这儿消费了15块钱是怎么治。', 'speaker': '1' }, { 'bg': '8780', 'ed': '13130', 'onebest': '噢您是手机话费扣的款还是什么课的款？先生。', 'speaker': '2' }, { 'bg': '13420', 'ed': '17990', 'onebest': '我也不清楚，啊我把移动移动刚刚说等你们问问。', 'speaker': '1' }, { 'bg': '18910', 'ed': '20200', 'onebest': '您稍等。', 'speaker': '2' }, { 'bg': '20610', 'ed': '22210', 'onebest': '啊对，啊嗯', 'speaker': '1' }, { 'bg': '22250', 'ed': '23520', 'onebest': '帮我看看。', 'speaker': '1' }, { 'bg': '24050', 'ed': '30940', 'onebest': '您好，吧现在是您在您说这个您来电的手机号被扣款了是吗？也无所谓。吧。', 'speaker': '2' }, { 'bg': '30960', 'ed': '32320', 'onebest': '好的，你说的。', 'speaker': '1' }]
  },
  emotion: {
    processor: 'clevo',
    taskId: faker.random.uuid(),
    status: 'processing',
    result: undefined
  },
  nlp: {
    processor: 'other',
    taskId: faker.random.uuid(),
    status: 'started',
    result: undefined
  },
  statistics: {
    speechDuration: 900 + faker.random.number(100),
    slienceDuration: faker.random.number(200),
    staffTalkDuraion: faker.random.number(500),
    customerTalkDuration: faker.random.number(500)
  },
  scores: {
    politeness: faker.random.number(5),
    scripts: faker.random.number(5),
    emotion: faker.random.number(5),
    overall: faker.random.number(5)
  },
  breakdowns: [{
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
  }],
  subject: faker.lorem.word()
}

const { seed, unseed, login, logout } = require('./data.seeding')
// const app = require('../server')
// let server = null

beforeAll(() => {
  return seed().then(result => {
    return login(client, result.email, result.password).then(result => {
      variables.staff = result._id
      variables.organization = result.organization._id
    })
  })
//   return new Promise((resolve, reject) => {
//     server = app.listen(PORT, () => {
//       debug('Server started on port: ', PORT)
//       setTimeout(() => {
//         resolve()
//       }, 5000)
//     })
//   })
})

afterAll(() => {
  return logout(client).then(result => {
    return unseed()
  })
//   return new Promise((resolve, reject) => {
//     server.close(() => {
//       debug('Server closed on port: ', PORT)
//       resolve()
//     })
//   })
})

test('create call', () => {
  let operationName = 'callCreate'
  return client.mutate({
    mutation: tag`
      mutation callCreate (
        $staff: MongoID,
        $organization: MongoID,
        $status: EnumCallStatus,
        $format: EnumCallFormat,
        $encoding: EnumCallEncoding,
        $source: String,
        $startedAt: Date,
        $transcription: CallTranscriptionInput,
        $emotion: CallEmotionInput,
        $nlp: CallNlpInput,
        $statistics: CallStatisticsInput,
        $scores: CallScoresInput,
        $breakdowns: [CallCallBreakdownsInput],
        $subject: String
      ) { callCreate (record: {
        staff: $staff,
        organization: $organization,
        status: $status,
        format: $format,
        encoding: $encoding,
        source: $source,
        startedAt: $startedAt,
        transcription: $transcription,
        emotion: $emotion,
        nlp: $nlp,
        statistics: $statistics,
        scores: $scores,
        breakdowns: $breakdowns,
        subject: $subject
      }) {
        recordId
        record {
          _id,
          status,
          staff {
            email,
            staffId,
            name,
            title,
            role,
            status
          },
          organization {
            name,
            status
          },
          format,
          encoding,
          source,
          startedAt,
          transcription {
            processor,
            taskId,
            status,
            result
          },
          emotion {
            processor,
            taskId,
            status,
            result
          },
          nlp {
            processor,
            taskId,
            status,
            result
          },
          statistics {
            speechDuration,
            slienceDuration,
            staffTalkDuraion,
            customerTalkDuration
          },
          scores {
            politeness,
            scripts,
            emotion,
            overall
          },
          breakdowns {
            begin,
            end,
            transcript,
            emotion,
            intent,
            speaker,
            bannedWords,
            sensitiveWords,
            _id
          },
          subject,
          createdAt,
          updatedAt
        }
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('create call', result)
    variables.id = result[operationName].recordId
    expect(result[operationName].record.createdAt).toEqual(result[operationName].record.updatedAt)
    // expect(result.staff).toEqual(expect.objectContaining(staff))
    // expect(result.organization).toEqual(expect.objectContaining(organization))
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.format).toEqual(variables.format)
    expect(result[operationName].record.encoding).toEqual(variables.encoding)
    expect(result[operationName].record.source).toEqual(variables.source)
    expect(result[operationName].record.startedAt).toEqual(variables.startedAt.toISOString())
    // expect(result[operationName].record.transcription).toEqual(variables.transcription)
    // expect(result[operationName].record.emotion).toEqual(variables.emotion)
    // expect(result[operationName].record.nlp).toEqual(variables.nlp)
    expect(result[operationName].record.statistics).toEqual(expect.objectContaining(variables.statistics))
    expect(result[operationName].record.scores).toEqual(expect.objectContaining(variables.scores))
    expect(result[operationName].record.breakdowns.length).toBe(variables.breakdowns.length)
    expect(result[operationName].record.subject).toEqual(variables.subject)
  }).catch(error => {
    debug('create call failed!', error)
  })
})

test('read call', () => {
  let operationName = 'callById'
  return client.query({
    query: tag`
      query callById (
        $id: MongoID!
      ) { callById (
        _id: $id
      ) {
        _id,
        status,
        staff {
          email,
          staffId,
          name,
          title,
          role,
          status
        },
        organization {
          name,
          status
        },
        format,
        encoding,
        source,
        startedAt,
        transcription {
          processor,
          taskId,
          status,
          result
        },
        emotion {
          processor,
          taskId,
          status,
          result
        },
        nlp {
          processor,
          taskId,
          status,
          result
        },
        statistics {
          speechDuration,
          slienceDuration,
          staffTalkDuraion,
          customerTalkDuration
        },
        scores {
          politeness,
          scripts,
          emotion,
          overall
        },
        breakdowns {
          begin,
          end,
          transcript,
          emotion,
          intent,
          speaker,
          bannedWords,
          sensitiveWords,
          _id
        },
        subject,
        createdAt,
        updatedAt
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('read call', result)
    expect(result[operationName].createdAt).toEqual(result[operationName].updatedAt)
    // expect(result.staff).toEqual(expect.objectContaining(staff))
    // expect(result.organization).toEqual(expect.objectContaining(organization))
    expect(result[operationName].status).toEqual(variables.status)
    expect(result[operationName].format).toEqual(variables.format)
    expect(result[operationName].encoding).toEqual(variables.encoding)
    expect(result[operationName].source).toEqual(variables.source)
    expect(result[operationName].startedAt).toEqual(variables.startedAt.toISOString())
    // expect(result[operationName].transcription).toEqual(variables.transcription)
    // expect(result[operationName].emotion).toEqual(variables.emotion)
    // expect(result[operationName].nlp).toEqual(variables.nlp)
    expect(result[operationName].statistics).toEqual(expect.objectContaining(variables.statistics))
    expect(result[operationName].scores).toEqual(expect.objectContaining(variables.scores))
    expect(result[operationName].breakdowns.length).toBe(variables.breakdowns.length)
    expect(result[operationName].subject).toEqual(variables.subject)
  })
})

test('delete call', () => {
  let operationName = 'callDelete'
  return client.mutate({
    mutation: tag`
      mutation callDelete (
        $id: MongoID!
      ) { callDelete (
        _id: $id
      ) {
        recordId
        record {
          _id,
          status,
          staff {
            email,
            staffId,
            name,
            title,
            role,
            status
          },
          organization {
            name,
            status
          },
          format,
          encoding,
          source,
          startedAt,
          transcription {
            processor,
            taskId,
            status,
            result
          },
          emotion {
            processor,
            taskId,
            status,
            result
          },
          nlp {
            processor,
            taskId,
            status,
            result
          },
          statistics {
            speechDuration,
            slienceDuration,
            staffTalkDuraion,
            customerTalkDuration
          },
          scores {
            politeness,
            scripts,
            emotion,
            overall
          },
          breakdowns {
            begin,
            end,
            transcript,
            emotion,
            intent,
            speaker,
            bannedWords,
            sensitiveWords,
            _id
          },
          subject,
          createdAt,
          updatedAt
        }
      }}
    `,
    variables
  }).then(body => {
    let result = body.data
    debug('delete call', result)
    expect(result[operationName].recordId).toEqual(variables.id)
    expect(result[operationName].record).toEqual(expect.anything())
  })
})
