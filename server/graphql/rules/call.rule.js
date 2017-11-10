const Rule = require('graphql-rule')
// const debug = require('debug')('call.rule')

// Define access rules.
const CallRule = Rule.create({
  name: 'Call',
  props: {
    isMaster: (model) => {
      return !!model.$context.user && (model.$context.user.role === 'master')
    },
    isAdmin: (model) => {
      return !!model.$context.user && (model.$context.user.role === 'admin')
    },
    isOwner: (model) => {
      return !!model.$context.user && !!model.$data && !!model.$data.staff &&
        (model.$context.user._id.toString() === model.$data.staff._id.toString())
    }
  },
  defaultRule: {
    preRead: true,
    read: true
  }
})

module.exports = CallRule
