const { composeWithMongoose } = require('graphql-compose-mongoose')

// convert mongoose schema
const { TeamSchema } = require('../mongoose')
const TeamType = composeWithMongoose(TeamSchema)

// add additional resolvers
TeamType.addResolver({
  name: 'findByName',
  type: TeamType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return TeamSchema.findOne({name: args.name})
  }
})

TeamType.addResolver({
  name: 'removeByName',
  type: TeamType.getResolver('removeById').getType(),
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return TeamSchema.findOneAndRemove({name: args.name}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = TeamType
