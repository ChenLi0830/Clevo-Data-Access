const {composeWithMongoose} = require('graphql-compose-mongoose')

// convert mongoose schema
const Call = require('../../models/call')
const CallType = composeWithMongoose(Call)
// const UserType = require('./user_type')
const OrganizationType = require('./organization_type')

// CallType.addRelation('staff', {
//   resolver: UserType.getResolver('findById'),
//   prepareArgs: {
//     _id: (source) => source.staff
//   },
//   projection: { staff: true }
// })

CallType.addRelation('organization', {
  resolver: OrganizationType.getResolver('findById'),
  prepareArgs: {
    _id: (source) => source.organization
  },
  projection: { organization: true }
})

module.exports = CallType
