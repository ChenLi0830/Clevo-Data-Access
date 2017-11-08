const { composeWithMongoose } = require('graphql-compose-mongoose')

// convert mongoose schema
const { CallSchema } = require('../mongoose')
const CallType = composeWithMongoose(CallSchema)

module.exports = CallType
