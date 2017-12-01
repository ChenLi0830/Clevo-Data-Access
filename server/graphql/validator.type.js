const { composeWithMongoose } = require('graphql-compose-mongoose')
const debug = require('debug')('team.type')

// convert mongoose schema
const { ValidatorSchema } = require('../mongoose')
const ValidatorType = composeWithMongoose(ValidatorSchema)

// add additional resolvers
ValidatorType.addResolver({
  name: 'findByName',
  type: ValidatorType,
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return ValidatorSchema.findOne({name: args.name})
  }
})

ValidatorType.addResolver({
  name: 'removeByName',
  type: ValidatorType.getResolver('removeById').getType(),
  args: {
    name: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return ValidatorSchema.findOneAndRemove({name: args.name}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = ValidatorType
