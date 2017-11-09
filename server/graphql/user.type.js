const { GraphQLNonNull } = require('graphql')
const { composeWithMongoose } = require('graphql-compose-mongoose')
const passport = require('passport')
const debug = require('debug')('user.type')
const { UserRule } = require('./rules')

// convert mongoose schema
const { UserSchema } = require('../mongoose/')
const UserType = composeWithMongoose(UserSchema)

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
    team: new GraphQLNonNull(UserType.getFieldType('team'))
  },
  resolve: ({source, args, context, info}) => {
    return new UserSchema(args).save().then(result => {
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
  type: 'String!',
  args: {
    email: 'String'
  },
  resolve: ({source, args, context, info}) => {
    if (!context.user) return Promise.reject(new Error('Not logged in.'))
    let rule = new UserRule(args, context)
    let email = args.email ? args.email.toLowerCase() : context.user.email
    debug('resetPassword', email)
    if (!rule.$props.isAdmin && (email !== context.user.email)) {
      return Promise.reject(new Error('You need to be admin or owner to perform this action.'))
    }
    let newPassword = (Math.random() + 1).toString(36).substring(2)
    return UserSchema.findOne({
      email: email
    }).then(user => {
      user.password = newPassword
      user.save()
    }).then(result => {
      return newPassword
    })
  }
})

UserType.addResolver({
  name: 'changePassword',
  type: UserType,
  args: {
    oldPassword: 'String!',
    newPassword: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    if (!context.user) return Promise.reject(new Error('Not logged in.'))
    return UserSchema.findById(context.user._id).then(user => {
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
    return UserSchema.findOne({email: args.email.toLowerCase()})
  }
})

UserType.wrapResolverResolve('updateById', (next) => (rp) => {
  // rp = resolveParams = { source, args, context, info }
  debug('updateById wrap', rp.args, rp.context.user)
  let rule = new UserRule(rp.args.record, rp.context)
  if (!rule.$props.isAdmin && !rule.$props.isOwner) {
    throw new Error('You need to be admin or owner to perform this action.')
  }
  return next(rp)
})

UserType.wrapResolverResolve('removeById', (next) => (rp) => {
  // rp = resolveParams = { source, args, context, info }
  debug('updateById wrap', rp.args, rp.context.user)
  let rule = new UserRule(rp.args.record, rp.context)
  if (!rule.$props.isAdmin) {
    throw new Error('You need to be admin to perform this action.')
  }
  return next(rp)
})

UserType.addResolver({
  name: 'removeByEmail',
  type: UserType.getResolver('removeById').getType(),
  args: {
    email: 'String!'
  },
  resolve: ({source, args, context, info}) => {
    debug('removeByEmail', args, context.user)
    let rule = new UserRule(args, context)
    if (!rule.$props.isAdmin) {
      throw new Error('You need to be admin to perform this action.')
    }
    return UserSchema.findOneAndRemove({
      email: args.email.toLowerCase()
    }).then(result => {
      return {
        recordId: result.id,
        record: result
      }
    })
  }
})

module.exports = UserType
