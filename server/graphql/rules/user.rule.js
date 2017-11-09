const Rule = require('graphql-rule')
// const debug = require('debug')('user.rule')

// Define access rules.
const UserRule = Rule.create({
  name: 'User',
  props: {
    isAdmin: (model) => {
      return !!model.$context.user && (model.$context.user.role === 'admin')
    },
    isOwner: (model) => {
      return !!model.$context.user && !!model.$data && (model.$context.user._id.toString() === model.$data._id.toString())
    }
  },
  defaultRule: {
    preRead: true,
    read: true
  },
  rules: {
    email: {
      read: (model) => model.$props.isAdmin || model.$props.isOwner,
      readFail: () => { throw new Error('Permission denied to read user email field') }
    }
  }
})

module.exports = UserRule
