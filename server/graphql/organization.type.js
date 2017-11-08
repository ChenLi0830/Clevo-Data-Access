const { composeWithMongoose } = require('graphql-compose-mongoose')

// convert mongoose schema
const { OrganizationSchema } = require('../mongoose')
const OrganizationType = composeWithMongoose(OrganizationSchema)

// add additional resolvers
OrganizationType.addResolver({
  name: 'findByName',
  type: OrganizationType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return OrganizationSchema.findOne({name: args.name})
  }
})

OrganizationType.addResolver({
  name: 'removeByName',
  type: OrganizationType.getResolver('removeById').getType(),
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return OrganizationSchema.findOneAndRemove({name: args.name}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = OrganizationType
