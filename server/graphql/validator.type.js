const { composeWithMongoose } = require('graphql-compose-mongoose')
const debug = require('debug')('team.type')

// convert mongoose schema
const { ValidatorSchema, CallSchema } = require('../mongoose')
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

ValidatorType.addResolver({
  name: 'validateCall',
  type: ValidatorType,
  args: {
    validatorId: 'ID!',
    callId: 'ID!',
    rating: 'Int!'
  },
  resolve: ({source, args, context, info}) => {
    return CallSchema.findById(args.callId)
    .then(result => {
      return CallSchema.findByIdAndUpdate(args.callId, {
        riskyRatings: [
          ...(result.riskyRatings || []),
          {
            validator: args.validatorId,
            rating: args.rating
          }
        ]
      })
    })
    .then(() => {
      return ValidatorSchema.findById(args.validatorId)
    })
    .then(result => {
      return ValidatorSchema.findByIdAndUpdate(args.validatorId, {
        validatedCalls: [...(result.validatedCalls || []), args.callId]
      })
    })
  }
})

module.exports = ValidatorType
