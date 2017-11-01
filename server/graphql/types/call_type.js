const {composeWithMongoose} = require('graphql-compose-mongoose')

// convert mongoose schema
const Call = require('../../models/call')
const CallType = composeWithMongoose(Call)

module.exports = CallType
