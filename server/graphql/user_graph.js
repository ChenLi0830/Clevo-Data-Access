const {composeWithMongoose} = require('graphql-compose-mongoose')

// convert mongoose schema
const User = require('../models/user')
const UserType = composeWithMongoose(User)

// add additional resolvers
UserType.addResolver({
  name: 'findByEmail',
  type: UserType,
  args: {
    email: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return User.findOne({email: args.email.toLowerCase()})
  }
})

UserType.addResolver({
  name: 'removeByEmail',
  type: UserType.getResolver('removeById').getType(),
  args: {
    email: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return User.findOneAndRemove({email: args.email.toLowerCase()}).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = UserType
