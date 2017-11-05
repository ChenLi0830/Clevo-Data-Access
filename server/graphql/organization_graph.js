const {composeWithMongoose} = require('graphql-compose-mongoose')

// convert mongoose schema
const Organization = require('../models/organization')
const OrganizationType = composeWithMongoose(Organization)

// add additional resolvers
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
