const Rule = require('graphql-rule')
const debug = require('debug')('team.rule')

// Define access rules.
const TeamRule = Rule.create({
  name: 'Team',
  props: {
    isAdmin: (model) => {
      return !!model.$context.user && (model.$context.user.role === 'admin')
    },
    isMember: (model) => {
      debug('isMember', model.$context.user.team._id, model.$data._id, (model.$context.user._id.toString() === model.$data._id.toString()))
      return !!model.$context.user && !!model.$context.user.team && !!model.$data &&
        (model.$context.user.team._id.toString() === model.$data._id.toString())
    }
  },
  defaultRule: {
    preRead: true,
    read: true
  },
  rules: {
    users: {
      preRead: (model) => {
        return model.$props.isMember
      },
      readFail: () => { throw new Error('Permission denied to read users field') }
    }
  }
})

module.exports = TeamRule
