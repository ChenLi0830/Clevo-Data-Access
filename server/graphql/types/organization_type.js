const {composeWithMongoose} = require('graphql-compose-mongoose')

// convert mongoose schema
const Organization = require('../../models/organization')
const OrganizationType = composeWithMongoose(Organization)

// add additional resolver
OrganizationType.addResolver({
  name: 'findByName',
  type: OrganizationType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return Organization.findOne({name: args.name})
  }
})

OrganizationType.addResolver({
  name: 'removeByName',
  type: OrganizationType.getResolver('removeById').getType(),
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return Organization.findOneAndRemove({name: args.name}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = OrganizationType

// const graphql = require('graphql')
// const {
//   GraphQLObjectType,
//   GraphQLString,
//   GraphQLEnumType,
//   GraphQLID
// } = graphql
// const UserType = require('./user_type')
// const TeamType = require('./team_type')
// const {GraphQLDateTime} = require('graphql-iso-date')

// const StatusType = new GraphQLEnumType({
//   name: 'status',
//   values: {
//     active: {
//       value: 'active'
//     },
//     inactive: {
//       value: 'inactive'
//     }
//   }
// })

// const OrganizationType = new GraphQLObjectType({
//   name: 'OrganizationType',
//   fields: () => {
//     return {
//       id: {
//         type: GraphQLID,
//         required: true
//       },
//       name: {
//         type: GraphQLString,
//         required: true
//       },
//       status: {
//         type: StatusType
//       },
//       createdBy: {
//         type: UserType
//       },
//       teamList: {
//         type: new GraphQLList(TeamType)
//       },
//       createdAt: {
//         type: GraphQLDateTime
//       },
//       updatedAt: {
//         type: GraphQLDateTime
//       }
//     }
//   }
// })

// module.exports = OrganizationType
