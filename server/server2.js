const express = require('express')
const models = require('./models')
const expressGraphQL = require('express-graphql')
const schema = require('./schema/schema')
// const schema = require('../graphql/schema');
// const schema = require('./schema');

const app = express()

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true,
}))

app.listen(4001, () => {
  console.log('Listening port on 4001')
})