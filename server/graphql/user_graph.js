const { GraphQLNonNull } = require('graphql')
const {composeWithMongoose} = require('graphql-compose-mongoose')
const passport = require('passport')
// const debug = require('debug')('user_graph')

// convert mongoose schema
const User = require('../models/user')
const UserType = composeWithMongoose(User)

// remove sensitive fields
UserType.removeField('password')

// add additional resolvers
UserType.addResolver({
  name: 'signup',
  type: UserType,
  args: {
    email: new GraphQLNonNull(UserType.getFieldType('email')),
    password: 'String!',
    staffId: new GraphQLNonNull(UserType.getFieldType('staffId')),
    name: new GraphQLNonNull(UserType.getFieldType('name')),
    title: UserType.getFieldType('title'),
    role: UserType.getFieldType('role'),
    status: UserType.getFieldType('status'),
    team: new GraphQLNonNull(UserType.getFieldType('team')),
    organization: new GraphQLNonNull(UserType.getFieldType('organization'))
  },
  resolve: ({source, args, context, info}) => {
    return new User(args).save().then(result => {
      return new Promise((resolve, reject) => {
        context.login(result, (err) => {
          if (err) { reject(err) }
          resolve(result)
        })
      })
    })
  }
})

UserType.addResolver({
  name: 'login',
  type: UserType,
  args: {
    email: 'String!',
    password: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', (err, user) => {
        if (err) { reject(err) }
        if (!user) { reject(new Error('Invalid credentials.')) }
        context.login(user, () => resolve(user))
      })({
        body: {
          email: args.email,
          password: args.password
        }
      })
    })
  }
})

UserType.addResolver({
  name: 'logout',
  type: UserType,
  args: {
    email: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    let user = context.user
    context.logout()
    return user
  }
})

UserType.addResolver({
  name: 'current',
  type: UserType,
  resolve: ({source, args, context, info}) => {
    return context.user
  }
})

UserType.addResolver({
  name: 'resetPassword',
  type: UserType,
  args: {
    email: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return User.findOne({email: args.email.toLowerCase()}).then(user => {
      user.password = undefined
      return user.save()
    })
  }
})

UserType.addResolver({
  name: 'changePassword',
  type: UserType,
  args: {
    email: 'String!',
    oldPassword: 'String!',
    newPassword: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    return User.findOne({email: args.email.toLowerCase()}).then(user => {
      return new Promise((resolve, reject) => {
        user.comparePassword(args.oldPassword, (err, isMatch) => {
          if (err) { reject(err) }
          if (isMatch) {
            user.password = args.newPassword
            resolve(user.save())
          }
          reject(new Error('Invalid credentials.'))
        })
      })
    })
  }
})

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
