const { createApolloFetch } = require('apollo-fetch')
const debug = require('debug')('test.test')
const faker = require('faker')
const PORT = process.env.PORT || 4000

const fetch = createApolloFetch({
  uri: 'http://localhost:' + PORT + '/graphql'
})

const variables = {
  name: faker.company.companyName(),
  status: 'active',
  analyticRules: {
    sensitiveWords: faker.lorem.words().split(' '),
    bannedWords: faker.lorem.words().split(' '),
    emotionThreshold: faker.random.number(1),
    ratingThreshold: faker.random.number(5)
  }
}

let organizationCreateQuery = `
    mutation organizationCreate($name: String, $status: EnumOrganizationStatus, $analyticRules: OrganizationAnalyticRulesInput) { organizationCreate (record: {
      name: $name
      status: $status
      analyticRules: $analyticRules
    }) {
      recordId
      record {
        name
        status
        createdAt
        updatedAt
        analyticRules {
          emotionThreshold
          ratingThreshold
          bannedWords
          sensitiveWords
        }
      }
    }}
  `

test('create organization', () => {
  let operationName = 'organizationCreate'
  return fetch({
    query: organizationCreateQuery,
    variables: variables
  }).then(body => {
    let result = body.data
    debug('create organization', result)
    expect(result[operationName].record.name).toEqual(variables.name)
    expect(result[operationName].record.status).toEqual(variables.status)
    expect(result[operationName].record.createdAt).
      toEqual(result[operationName].record.updatedAt)
    expect(result[operationName].record.analyticRules.sensitiveWords).
      toEqual(expect.arrayContaining(variables.analyticRules.sensitiveWords))
    expect(result[operationName].record.analyticRules.bannedWords).
      toEqual(expect.arrayContaining(variables.analyticRules.bannedWords))
    expect(result[operationName].record.analyticRules.emotionThreshold).
      toEqual(variables.analyticRules.emotionThreshold)
    expect(result[operationName].record.analyticRules.ratingThreshold).
      toEqual(variables.analyticRules.ratingThreshold)
  })
})
